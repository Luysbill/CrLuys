import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const TOKEN_KEY = "crluys_admin_token";

export const apiClient = axios.create({
    baseURL: API,
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const tokenStore = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (t) => localStorage.setItem(TOKEN_KEY, t),
    clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const CATEGORIES = [
    {
        slug: "smart-investing",
        number: "01",
        name: "Smart Investing",
        short: "Smart Investing",
        tagline: "Build wealth. Secure your future.",
        description:
            "Curated tools, courses & strategies for financial freedom — from investing fundamentals to advanced wealth-building.",
        icon: "TrendingUp",
        accent: "from-amber-300/40 to-yellow-600/10",
    },
    {
        slug: "health-wellness",
        number: "02",
        name: "Health Home Doctor & Wellness",
        short: "Health & Wellness",
        tagline: "Your body. Your sanctuary.",
        description:
            "Premium wellness resources and at-home health solutions for vitality, longevity, and inner balance.",
        icon: "HeartPulse",
        accent: "from-rose-300/30 to-amber-700/10",
    },
    {
        slug: "fitness-nutrition",
        number: "03",
        name: "Fitness & Nutrition",
        short: "Fitness & Nutrition",
        tagline: "Sculpt strength. Nourish life.",
        description:
            "Programs, meal plans and supplements engineered to elevate your physique, performance and energy.",
        icon: "Dumbbell",
        accent: "from-emerald-300/30 to-amber-700/10",
    },
    {
        slug: "self-sufficiency",
        number: "04",
        name: "Self Sufficiency",
        short: "Self Sufficiency",
        tagline: "Independent living. By design.",
        description:
            "Off-grid energy, food preservation, and survival skills for a resilient, self-reliant lifestyle.",
        icon: "Leaf",
        accent: "from-lime-300/30 to-amber-700/10",
    },
    {
        slug: "mindset-balance",
        number: "05",
        name: "Mindset & Balance",
        short: "Mindset & Balance",
        tagline: "Master your inner world.",
        description:
            "Mental clarity, manifestation programs and emotional balance for a centered, intentional life.",
        icon: "Brain",
        accent: "from-violet-300/30 to-amber-700/10",
    },
];

export const CATEGORY_IMAGES = {
    "smart-investing":
        "https://static.prod-images.emergentagent.com/jobs/bf67ecea-fe54-413e-aee9-b3d228eff2a1/images/649ab03e30d1470eb799b19beb6984b87d48fc3da081a3c3dc954711304c465a.png",
    "health-wellness":
        "https://static.prod-images.emergentagent.com/jobs/bf67ecea-fe54-413e-aee9-b3d228eff2a1/images/d36f208df3a3d007b5a2ec36b7f548f60369488a7a6d33638d5187476cbae61d.png",
    "fitness-nutrition":
        "https://static.prod-images.emergentagent.com/jobs/bf67ecea-fe54-413e-aee9-b3d228eff2a1/images/9c1a831a26cce4f2bf72b18dd636bdcf9bedfc2f5f67e69d05df8e2104ace1c9.png",
    "self-sufficiency":
        "https://static.prod-images.emergentagent.com/jobs/bf67ecea-fe54-413e-aee9-b3d228eff2a1/images/4137e014cc04c6e520118e218e3a3a5e4e008210319e49218ee3b5e8eed58697.png",
    "mindset-balance":
        "https://static.prod-images.emergentagent.com/jobs/bf67ecea-fe54-413e-aee9-b3d228eff2a1/images/c34970b1d5e06c56297adbadcfecac0a69a2660e3e20c8b279943e60735d1b92.png",
};

export const HERO_IMAGE =
    "https://static.prod-images.emergentagent.com/jobs/bf67ecea-fe54-413e-aee9-b3d228eff2a1/images/fa324654c60b2de799f373d28b71d56192ccab6b031388ff49911082c13a47fa.png";

export function formatApiErrorDetail(detail) {
    if (detail == null) return "Something went wrong. Please try again.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
        return detail
            .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
            .filter(Boolean)
            .join(" ");
    if (detail && typeof detail.msg === "string") return detail.msg;
    return String(detail);
}
