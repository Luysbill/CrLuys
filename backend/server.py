from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import re
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

# ---------------- Mongo ----------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# ---------------- App ----------------
app = FastAPI(title="CrLuys LifeStyle API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("crluys")

# ---------------- Auth helpers ----------------
JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 12,
        path="/",
    )


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin only")
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- Models ----------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class LoginResponse(BaseModel):
    user: UserOut
    token: str


class Testimonial(BaseModel):
    name: str
    location: Optional[str] = ""
    quote: str
    rating: int = 5


class FAQItem(BaseModel):
    question: str
    answer: str


class ProductBase(BaseModel):
    title: str
    slug: str
    category: str  # one of: smart-investing, health-wellness, fitness-nutrition, self-sufficiency, mindset-balance
    headline: str = ""
    short_description: str = ""
    long_description: str = ""
    price: float = 0.0
    original_price: Optional[float] = None
    image_url: str = ""
    gallery: List[str] = []
    affiliate_url: str = ""
    benefits: List[str] = []
    testimonials: List[Testimonial] = []
    faq: List[FAQItem] = []
    badges: List[str] = []
    rating: float = 4.9
    reviews_count: int = 0
    featured: bool = False
    start_here: bool = False
    is_active: bool = True
    order: int = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    headline: Optional[str] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    image_url: Optional[str] = None
    gallery: Optional[List[str]] = None
    affiliate_url: Optional[str] = None
    benefits: Optional[List[str]] = None
    testimonials: Optional[List[Testimonial]] = None
    faq: Optional[List[FAQItem]] = None
    badges: Optional[List[str]] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    featured: Optional[bool] = None
    start_here: Optional[bool] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None


class ProductOut(ProductBase):
    id: str
    created_at: str
    updated_at: str


class NewsletterIn(BaseModel):
    email: EmailStr


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    message: str


# ---------------- Slug util ----------------
def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


def product_to_out(doc: dict) -> dict:
    doc = {**doc}
    doc["id"] = str(doc.pop("_id"))
    for k in ("created_at", "updated_at"):
        v = doc.get(k)
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc


# ---------------- Fixed Categories ----------------
CATEGORIES = [
    {
        "slug": "smart-investing",
        "number": "01",
        "name": "Smart Investing",
        "tagline": "Build wealth. Secure your future.",
        "description": "Curated tools, courses & strategies for financial freedom — from investing fundamentals to advanced wealth-building.",
        "icon": "TrendingUp",
    },
    {
        "slug": "health-wellness",
        "number": "02",
        "name": "Health Home Doctor & Wellness",
        "tagline": "Your body. Your sanctuary.",
        "description": "Premium wellness resources and at-home health solutions for vitality, longevity, and inner balance.",
        "icon": "HeartPulse",
    },
    {
        "slug": "fitness-nutrition",
        "number": "03",
        "name": "Fitness & Nutrition",
        "tagline": "Sculpt strength. Nourish life.",
        "description": "Programs, meal plans and supplements engineered to elevate your physique, performance and energy.",
        "icon": "Dumbbell",
    },
    {
        "slug": "self-sufficiency",
        "number": "04",
        "name": "Self Sufficiency",
        "tagline": "Independent living. By design.",
        "description": "Off-grid energy, food preservation, and survival skills for a resilient, self-reliant lifestyle.",
        "icon": "Leaf",
    },
    {
        "slug": "mindset-balance",
        "number": "05",
        "name": "Mindset & Balance",
        "tagline": "Master your inner world.",
        "description": "Mental clarity, manifestation programs and emotional balance for a centered, intentional life.",
        "icon": "Brain",
    },
]
CATEGORY_SLUGS = {c["slug"] for c in CATEGORIES}


# ---------------- Seed products ----------------
SEED_PRODUCTS = [
    # 01 SMART INVESTING
    {
        "title": "Keystone Investors Club",
        "slug": "keystone-investors-club",
        "category": "smart-investing",
        "headline": "Secure Your Financial Future — Today.",
        "short_description": "A practical investment club providing curated insights, market strategies and step-by-step guidance for financial growth.",
        "long_description": "The Keystone Investors Club gives you proven frameworks to think and invest with clarity. Learn how to invest with confidence, build long-term wealth, and master decision-making — even if you are starting from zero.",
        "price": 1254.00,
        "image_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "Proven investing frameworks for long-term wealth",
            "Live monthly market analysis & decisions",
            "Private member-only community",
            "Step-by-step roadmap from beginner to confident investor",
        ],
        "badges": ["Premium", "Members Only"],
        "rating": 4.9,
        "reviews_count": 412,
        "featured": True,
        "start_here": True,
        "order": 1,
    },
    {
        "title": "The Billionaire Brainwave",
        "slug": "the-billionaire-brainwave",
        "category": "smart-investing",
        "headline": "Rewire Your Mind for Wealth.",
        "short_description": "Audio program designed to help you develop the mindset and habits of high-net-worth thinkers.",
        "long_description": "Engineered with frequency-based audio, The Billionaire Brainwave helps you replace scarcity thinking with abundance habits in just 7 minutes a day.",
        "price": 52.65,
        "image_url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "7-minute daily audio session",
            "Replace limiting beliefs with wealth habits",
            "Backed by neuroscience-inspired audio design",
            "Lifetime access + bonus tracks",
        ],
        "rating": 4.8,
        "reviews_count": 1280,
        "featured": True,
        "order": 2,
    },
    {
        "title": "Ultimate Budget Planner",
        "slug": "ultimate-budget-planner",
        "category": "smart-investing",
        "headline": "Take Full Control of Your Money.",
        "short_description": "A simple, elegant budget system that helps you track income, expenses and savings in one place.",
        "long_description": "Designed for clarity. Built for execution. The Ultimate Budget Planner turns money confusion into a one-page command center — so you always know where you stand.",
        "price": 42.56,
        "image_url": "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "All-in-one income & expense dashboard",
            "Automated savings goals tracker",
            "Works with Google Sheets — no software",
            "Premium Notion-style aesthetic",
        ],
        "rating": 4.9,
        "reviews_count": 845,
        "start_here": True,
        "order": 3,
    },
    {
        "title": "Monetary Distribution Method",
        "slug": "monetary-distribution-method",
        "category": "smart-investing",
        "headline": "The System Wealthy Households Use.",
        "short_description": "A practical guide on how to distribute, allocate and grow money like the financially elite.",
        "long_description": "Stop guessing. Start allocating. The Monetary Distribution Method gives you a clear, repeatable framework for assigning every dollar a job — across spending, investing and freedom.",
        "price": 114.39,
        "image_url": "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "The 6-bucket wealth allocation model",
            "Tax-aware distribution strategies",
            "Family wealth principles",
            "Quarterly review templates included",
        ],
        "rating": 4.8,
        "reviews_count": 322,
        "order": 4,
    },
    # 02 HEALTH HOME DOCTOR & WELLNESS
    {
        "title": "Emergency Home Doctor",
        "slug": "emergency-home-doctor",
        "category": "health-wellness",
        "headline": "Practical Medicine For Every Household.",
        "short_description": "Be ready for any emergency at home — without needing instant access to a doctor.",
        "long_description": "A complete digital handbook that helps you handle emergencies and common conditions with calm, clarity and confidence — anytime, anywhere.",
        "price": 49.88,
        "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "Step-by-step guides for 60+ household emergencies",
            "Natural remedies & evidence-based protocols",
            "Instant digital access — works offline",
            "Family-friendly language, no jargon",
        ],
        "rating": 4.9,
        "reviews_count": 2104,
        "featured": True,
        "start_here": True,
        "order": 1,
    },
    {
        "title": "NeuroPrime",
        "slug": "neuroprime",
        "category": "health-wellness",
        "headline": "Sharper Focus. Calmer Mind.",
        "short_description": "Improve memory, focus and mental clarity using natural ingredients.",
        "long_description": "NeuroPrime combines clean nootropics with adaptogens for deep, smooth focus — without the crash.",
        "price": 80.15,
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "Clinical-grade nootropic stack",
            "Caffeine-free, non-habit forming",
            "Boosts memory & deep focus",
            "Daily clarity in one capsule",
        ],
        "rating": 4.7,
        "reviews_count": 968,
        "order": 2,
    },
    {
        "title": "Lean Bliss",
        "slug": "lean-bliss",
        "category": "health-wellness",
        "headline": "Lean Body. Balanced Energy.",
        "short_description": "Supports healthy weight management and balanced blood sugar with a calm, blissful lifestyle.",
        "long_description": "A premium daily supplement formulated with natural extracts to help you feel lighter, leaner and calmer — without the crash.",
        "price": 90.94,
        "image_url": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "Supports healthy weight",
            "Helps maintain balanced blood sugar",
            "Curbs cravings naturally",
            "Premium plant-based formula",
        ],
        "rating": 4.8,
        "reviews_count": 1340,
        "featured": True,
        "order": 3,
    },
    {
        "title": "Aizen Power",
        "slug": "aizen-power",
        "category": "health-wellness",
        "headline": "Restore Vitality. Confidence Returns.",
        "short_description": "A safe, effective male enhancement supplement that supports strength and mental concentration.",
        "long_description": "Aizen Power combines adaptogens and natural extracts to help you feel strong, focused and confident — every day.",
        "price": 83.92,
        "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "Supports male vitality & stamina",
            "Improves mental concentration",
            "Premium natural ingredients",
            "Backed by satisfied users worldwide",
        ],
        "rating": 4.6,
        "reviews_count": 730,
        "order": 4,
    },
    {
        "title": "Tonic Greens",
        "slug": "tonic-greens",
        "category": "health-wellness",
        "headline": "Daily Greens. Effortless Health.",
        "short_description": "A powerful greens supplement designed to support energy, immunity and overall health.",
        "long_description": "One scoop. Six nutrient categories. Tonic Greens delivers a high-density blend of greens, mushrooms, antioxidants and probiotics — the easiest way to nourish yourself daily.",
        "price": 79.00,
        "image_url": "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "57+ premium superfoods",
            "Supports immunity & gut health",
            "Boosts daily energy",
            "Smooth, naturally sweet taste",
        ],
        "rating": 4.8,
        "reviews_count": 1502,
        "start_here": True,
        "order": 5,
    },
    {
        "title": "The Complete Skin Reset System",
        "slug": "complete-skin-reset-system",
        "category": "health-wellness",
        "headline": "Natural Skin. Youthful Glow.",
        "short_description": "A natural skincare system that supports skin clarity, hydration and a youthful appearance.",
        "long_description": "Reset your skin from the inside out with a calm, intentional routine designed by holistic skin experts.",
        "price": 112.68,
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "5-step natural skin reset",
            "No harsh chemicals",
            "Hydration + clarity protocol",
            "Suitable for sensitive skin",
        ],
        "rating": 4.7,
        "reviews_count": 612,
        "order": 6,
    },
    # 03 FITNESS & NUTRITION
    {
        "title": "The Encyclopedia of Power Foods",
        "slug": "encyclopedia-of-power-foods",
        "category": "fitness-nutrition",
        "headline": "Eat For Power. Live With Vitality.",
        "short_description": "A comprehensive guide to the most powerful and nutritious foods you can add to your daily life.",
        "long_description": "From ancient superfoods to modern functional ingredients — this is the ultimate reference for nourishing your body with intention.",
        "price": 51.43,
        "image_url": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "200+ power foods catalogued",
            "Meal pairing principles",
            "Healing protocols by goal",
            "Beautiful, designer-quality format",
        ],
        "rating": 4.9,
        "reviews_count": 875,
        "featured": True,
        "start_here": True,
        "order": 1,
    },
    {
        "title": "12-Weeks Ketogenic Meal Plans",
        "slug": "12-weeks-ketogenic-meal-plans",
        "category": "fitness-nutrition",
        "headline": "A Lean Body In 12 Weeks.",
        "short_description": "A complete 12-week ketogenic meal plan with 100+ recipes, shopping lists and weekly trackers.",
        "long_description": "Designed to help you burn fat, improve energy and follow a healthy, sustainable lifestyle — without guesswork.",
        "price": 33.69,
        "image_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "100+ chef-tested keto recipes",
            "Weekly shopping lists",
            "Progress trackers",
            "Macro-balanced & sustainable",
        ],
        "rating": 4.8,
        "reviews_count": 1430,
        "featured": True,
        "order": 2,
    },
    {
        "title": "Mega Fitness Bundle",
        "slug": "mega-fitness-bundle",
        "category": "fitness-nutrition",
        "headline": "Train Smart. Live Strong.",
        "short_description": "A complete fitness and wellness bundle that delivers workouts, nutrition and mindset content.",
        "long_description": "Six programs in one. Build strength, stay consistent and elevate your lifestyle with this curated bundle.",
        "price": 92.92,
        "image_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "6 expert programs in one bundle",
            "Workouts for every level",
            "Lifetime updates",
            "Premium video quality",
        ],
        "rating": 4.7,
        "reviews_count": 540,
        "order": 3,
    },
    # 04 SELF SUFFICIENCY
    {
        "title": "No Grid Survival Projects",
        "slug": "no-grid-survival-projects",
        "category": "self-sufficiency",
        "headline": "Independent Living, By Design.",
        "short_description": "A practical, hands-on guide with do-it-yourself projects to build your off-grid skills.",
        "long_description": "Learn how to preserve food, purify water, build shelter, and create everyday solutions to live independently — without relying on the system.",
        "price": 47.73,
        "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "70+ DIY off-grid projects",
            "Food preservation playbook",
            "Water purification basics",
            "Lifetime digital access",
        ],
        "rating": 4.9,
        "reviews_count": 1850,
        "featured": True,
        "start_here": True,
        "order": 1,
    },
    {
        "title": "The Ultimate Energizer Guide",
        "slug": "ultimate-energizer-guide",
        "category": "self-sufficiency",
        "headline": "Cut Your Bills. Power Your Home.",
        "short_description": "Reduce or eliminate electricity costs and unexpected obligations from utility bills.",
        "long_description": "The Ultimate Energizer Guide shows you how to power your home using alternate energy solutions — clearly, calmly, and step-by-step.",
        "price": 51.05,
        "image_url": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "Step-by-step setup",
            "Reduce monthly utility bills",
            "Backup power for emergencies",
            "Beginner-friendly instructions",
        ],
        "rating": 4.7,
        "reviews_count": 980,
        "featured": True,
        "order": 2,
    },
    {
        "title": "Ultimate OFF-GRID Generator",
        "slug": "ultimate-off-grid-generator",
        "category": "self-sufficiency",
        "headline": "Your Home. Your Power.",
        "short_description": "Build your own off-grid generator and gain real energy independence at home.",
        "long_description": "The Ultimate OFF-GRID Generator shows you how to build your own clean power station — reduce energy costs and increase your home's resilience.",
        "price": 62.50,
        "image_url": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "Build-it-yourself blueprint",
            "Reduce energy dependency",
            "Premium materials list",
            "Maintenance & safety guide",
        ],
        "rating": 4.8,
        "reviews_count": 612,
        "order": 3,
    },
    {
        "title": "LUMI+ Water Bottle",
        "slug": "lumi-water-bottle",
        "category": "self-sufficiency",
        "headline": "Hydrate. Energize. Elevate.",
        "short_description": "A premium hydrogen-infused water bottle that energizes your body naturally.",
        "long_description": "Feel more energy, recover faster and support your body naturally with the LUMI+ Water Bottle.",
        "price": 97.00,
        "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "Hydrogen-infused water in minutes",
            "Premium build quality",
            "Travel-friendly design",
            "30-day satisfaction guarantee",
        ],
        "rating": 4.6,
        "reviews_count": 415,
        "order": 4,
    },
    # 05 MINDSET & BALANCE
    {
        "title": "His Secret Obsession",
        "slug": "his-secret-obsession",
        "category": "mindset-balance",
        "headline": "Unlock Deeper Connection.",
        "short_description": "A relationship guide that reveals key emotional triggers that build emotional attraction and connection.",
        "long_description": "Built on real-world relationship research, His Secret Obsession reveals how to build deeper, calmer and more honest connection.",
        "price": 54.15,
        "image_url": "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "Build deeper emotional connection",
            "Improve relationship communication",
            "Backed by proven psychology",
            "Beautifully written, easy to read",
        ],
        "rating": 4.7,
        "reviews_count": 1140,
        "featured": True,
        "order": 1,
    },
    {
        "title": "The Power of the Ancestors",
        "slug": "power-of-the-ancestors",
        "category": "mindset-balance",
        "headline": "Heal The Past. Empower The Future.",
        "short_description": "A spiritual development journey designed to bring inner balance and self-awareness.",
        "long_description": "Through guided lessons and practical techniques, you'll connect with ancestral wisdom and create a more meaningful, fulfilling life.",
        "price": 297.00,
        "image_url": "https://images.unsplash.com/photo-1474401860312-eb2316a1aa66?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "Guided ancestral healing meditations",
            "Inner balance & self-awareness",
            "Lifetime program access",
            "Private group community",
        ],
        "rating": 4.9,
        "reviews_count": 312,
        "start_here": True,
        "order": 2,
    },
    {
        "title": "The Genius Wave",
        "slug": "the-genius-wave",
        "category": "mindset-balance",
        "headline": "Unlock Your Inner Genius.",
        "short_description": "An audio program designed to improve focus, mental clarity and overall cognitive performance.",
        "long_description": "Just 7 minutes a day. The Genius Wave uses sound-based audio to gently re-tune your thinking patterns for deep clarity and intuition.",
        "price": 53.66,
        "image_url": "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=1200&q=80",
        "benefits": [
            "7-minute daily audio",
            "Improves focus & creativity",
            "Sound-based wellness science",
            "Lifetime access + bonuses",
        ],
        "rating": 4.8,
        "reviews_count": 920,
        "featured": True,
        "order": 3,
    },
]

DEFAULT_TESTIMONIALS = [
    {"name": "Sofia M.", "location": "Madrid, ES", "quote": "This completely transformed how I approach my mornings — I feel lighter and more focused than ever.", "rating": 5},
    {"name": "Daniel R.", "location": "Austin, TX", "quote": "Worth every penny. Premium quality, clear instructions, real results within weeks.", "rating": 5},
    {"name": "Elena K.", "location": "Lisbon, PT", "quote": "I tried so many things before this. Nothing comes close to the calm clarity it gave me.", "rating": 5},
]

DEFAULT_FAQ = [
    {"question": "Is this beginner-friendly?", "answer": "Absolutely. Every CrLuys product is curated for clarity, simplicity and effectiveness — even if it's your first step."},
    {"question": "How do I access my purchase?", "answer": "After completing checkout on the partner page, you'll receive instant digital access (or shipping confirmation for physical products) directly in your email."},
    {"question": "Is there a money-back guarantee?", "answer": "Yes — every featured product carries a satisfaction guarantee provided by its creator. Check the partner page for full terms."},
    {"question": "Will it work for me?", "answer": "These resources are designed to support a wide range of lifestyles. We curate only the products with proven results and high user satisfaction."},
]


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@crluys.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "CrLuys2026!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "CrLuys Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
        })
        logger.info(f"Seeded admin: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info(f"Reset admin password: {admin_email}")


async def seed_products():
    count = await db.products.count_documents({})
    if count > 0:
        return
    now = datetime.now(timezone.utc)
    docs = []
    for p in SEED_PRODUCTS:
        doc = {**p}
        doc.setdefault("affiliate_url", f"https://example.com/affiliate/{p['slug']}")
        doc.setdefault("benefits", [])
        doc.setdefault("testimonials", DEFAULT_TESTIMONIALS)
        doc.setdefault("faq", DEFAULT_FAQ)
        doc.setdefault("badges", [])
        doc.setdefault("gallery", [])
        doc.setdefault("rating", 4.8)
        doc.setdefault("reviews_count", 0)
        doc.setdefault("featured", False)
        doc.setdefault("start_here", False)
        doc.setdefault("is_active", True)
        doc.setdefault("order", 999)
        doc["created_at"] = now
        doc["updated_at"] = now
        docs.append(doc)
    await db.products.insert_many(docs)
    logger.info(f"Seeded {len(docs)} products")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.products.create_index("category")
    await db.subscribers.create_index("email", unique=True)
    await seed_admin()
    await seed_products()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ============================================================
# AUTH ROUTES
# ============================================================
@api.post("/auth/login", response_model=LoginResponse)
async def login(body: LoginRequest, response: Response):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_id = str(user["_id"])
    token = create_access_token(user_id, email)
    set_auth_cookie(response, token)
    return LoginResponse(
        user=UserOut(id=user_id, email=user["email"], name=user["name"], role=user["role"]),
        token=token,
    )


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_admin)):
    return UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"])


# ============================================================
# PUBLIC: CATEGORIES & PRODUCTS
# ============================================================
@api.get("/categories")
async def list_categories():
    return CATEGORIES


@api.get("/products")
async def list_products(
    category: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
    featured: Optional[bool] = Query(default=None),
):
    query: dict = {"is_active": True}
    if category and category in CATEGORY_SLUGS:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"short_description": {"$regex": q, "$options": "i"}},
            {"headline": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.products.find(query).sort([("order", 1), ("created_at", -1)]).to_list(500)
    return [product_to_out(d) for d in docs]


@api.get("/products/{slug}")
async def get_product_by_slug(slug: str):
    doc = await db.products.find_one({"slug": slug, "is_active": True})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_out(doc)


# ============================================================
# PUBLIC: NEWSLETTER & CONTACT
# ============================================================
@api.post("/newsletter")
async def subscribe_newsletter(body: NewsletterIn):
    email = body.email.lower().strip()
    try:
        await db.subscribers.update_one(
            {"email": email},
            {"$setOnInsert": {"email": email, "created_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
    except Exception as e:
        logger.error(f"newsletter error: {e}")
        raise HTTPException(status_code=500, detail="Subscription failed")
    return {"ok": True, "message": "You're in. Welcome to CrLuys LifeStyle."}


@api.post("/contact")
async def submit_contact(body: ContactIn):
    doc = {
        "id": str(uuid.uuid4()),
        "name": body.name.strip(),
        "email": body.email.lower().strip(),
        "message": body.message.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read": False,
    }
    await db.messages.insert_one(doc)
    return {"ok": True, "message": "Message received. We'll get back to you shortly."}


# ============================================================
# ADMIN: PRODUCT CRUD
# ============================================================
@api.get("/admin/products")
async def admin_list_products(_: dict = Depends(get_current_admin)):
    docs = await db.products.find({}).sort([("category", 1), ("order", 1)]).to_list(1000)
    return [product_to_out(d) for d in docs]


@api.post("/admin/products")
async def admin_create_product(payload: ProductCreate, _: dict = Depends(get_current_admin)):
    if payload.category not in CATEGORY_SLUGS:
        raise HTTPException(status_code=400, detail="Invalid category")
    slug = payload.slug or slugify(payload.title)
    if await db.products.find_one({"slug": slug}):
        raise HTTPException(status_code=400, detail="Slug already exists")
    now = datetime.now(timezone.utc)
    doc = payload.model_dump()
    doc["slug"] = slug
    doc["created_at"] = now
    doc["updated_at"] = now
    if not doc.get("testimonials"):
        doc["testimonials"] = DEFAULT_TESTIMONIALS
    if not doc.get("faq"):
        doc["faq"] = DEFAULT_FAQ
    result = await db.products.insert_one(doc)
    doc["_id"] = result.inserted_id
    return product_to_out(doc)


@api.put("/admin/products/{product_id}")
async def admin_update_product(product_id: str, payload: ProductUpdate, _: dict = Depends(get_current_admin)):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid id")
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if "category" in updates and updates["category"] not in CATEGORY_SLUGS:
        raise HTTPException(status_code=400, detail="Invalid category")
    if "slug" in updates:
        existing = await db.products.find_one({"slug": updates["slug"], "_id": {"$ne": ObjectId(product_id)}})
        if existing:
            raise HTTPException(status_code=400, detail="Slug already exists")
    updates["updated_at"] = datetime.now(timezone.utc)
    result = await db.products.find_one_and_update(
        {"_id": ObjectId(product_id)},
        {"$set": updates},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_out(result)


@api.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, _: dict = Depends(get_current_admin)):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid id")
    result = await db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}


# ============================================================
# ADMIN: SUBSCRIBERS & MESSAGES
# ============================================================
@api.get("/admin/subscribers")
async def admin_list_subscribers(_: dict = Depends(get_current_admin)):
    docs = await db.subscribers.find({}, {"_id": 0}).sort([("created_at", -1)]).to_list(2000)
    return docs


@api.get("/admin/messages")
async def admin_list_messages(_: dict = Depends(get_current_admin)):
    docs = await db.messages.find({}, {"_id": 0}).sort([("created_at", -1)]).to_list(2000)
    return docs


@api.delete("/admin/messages/{message_id}")
async def admin_delete_message(message_id: str, _: dict = Depends(get_current_admin)):
    result = await db.messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"ok": True}


# ---------------- Health ----------------
@api.get("/")
async def root():
    return {"app": "CrLuys LifeStyle", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
