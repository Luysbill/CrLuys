# CrLuys LifeStyle — Premium Lifestyle Marketplace

## Original Problem Statement
Create a premium modern lifestyle marketplace website for the brand "CrLuys LifeStyle".

- Slogan: "Elevate Your Health. Elevate Your Life."
- Cinematic, luxurious, modern, trustworthy, emotionally engaging, conversion-focused
- Dark elegant backgrounds + gold accents + Cormorant Garamond / Outfit typography
- 5 categories in exact order:
  1. Smart Investing
  2. Health Home Doctor & Wellness
  3. Fitness & Nutrition
  4. Self Sufficiency
  5. Mindset & Balance
- Internal product landing pages (with benefits, FAQ, testimonials, repeated CTAs) → external affiliate URL in new tab
- Admin panel with login for product CRUD, subscribers, contact messages
- Newsletter signup, live search & category filter, contact page
- English

## Architecture
- Backend: FastAPI + MongoDB (motor), JWT (PyJWT, HS256) + bcrypt password hashing
- Frontend: React 19 + react-router-dom + Tailwind + shadcn primitives + sonner toasts
- Auth: Bearer token in localStorage (cookie also set, but Bearer is primary)
- All API routes prefixed with `/api`

## User Personas
1. **Lifestyle Seeker (primary visitor)** — wants curated, premium recommendations across wellness, fitness, finance, mindset. Buys via affiliate CTAs.
2. **Newsletter Subscriber** — signs up for curated drops & offers.
3. **Brand Owner / Admin** — manages catalog, monitors subscribers and contact messages.

## Core Requirements (static)
- 5 categories fixed in order
- Internal product landing → external affiliate URL in NEW TAB
- Dark + gold premium aesthetic
- Mobile-first responsive
- Admin protected via JWT
- Conversion-focused product pages (benefits, testimonials, FAQ, repeated CTAs)

## What's Been Implemented (2026-05-17)
- ✅ Cinematic dark-and-gold homepage hero with 5 category CTA pills (smooth-scroll)
- ✅ 5 category sections on homepage with curated product cards (alternating layout)
- ✅ Trust bar (curated, verified, top-rated, secure, lifetime care)
- ✅ Premium product landing pages (split hero, benefits grid, testimonials, FAQ, repeated CTAs)
- ✅ Affiliate CTA opens external URL in new tab (`target="_blank" rel="noopener noreferrer"`)
- ✅ Category page with Start Here, benefits, full grid
- ✅ Contact page with submission
- ✅ Newsletter capture (homepage + footer)
- ✅ Live search + category filter on homepage
- ✅ Admin login (JWT, seeded admin)
- ✅ Admin dashboard with 3 tabs: Products (full CRUD), Subscribers, Messages
- ✅ 20 seeded sample products across all 5 categories
- ✅ Sticky responsive header (desktop nav + mobile hamburger menu)
- ✅ Backend tested: 27/27 ✅
- ✅ Frontend tested: 24/24 critical flows ✅

## Smart Investing External Integration (2026-05-17)
- ✅ Smart Investing wired directly to the external destination `https://wealth-unlock-3.emergent.host/` (Keystone Investors Club)
- ✅ Featured primary category: gold "FEATURED" badge on the hero pill + gold styling in header nav
- ✅ Hero CTA "Start Your Transformation" + FeaturedFinancialSection ("Financial Freedom Changes Everything." + 3 pillars + 4 stats + 3 CTAs) all wired
- ✅ `/category/smart-investing` shows cinematic handoff page; `/product/{smart-investing-slug}` triggers onboarding

## Lead-Capture Onboarding (2026-05-17)
- ✅ Premium luxury single-step modal between every Smart Investing CTA and Keystone destination
- ✅ Headline: "What's your #1 financial goal?" with 5 elegant optional goal options (long-term wealth / private deals / financial freedom / smart diversification / legacy)
- ✅ Optional name + required email · "Continue to Keystone" CTA
- ✅ Cinematic dark/gold UI, smooth fade-up entry, ESC + backdrop + close button dismiss (form state only)
- ✅ Confirm step "Welcome to the circle." → opens Keystone in NEW TAB via `window.open` after ~1.6s
- ✅ Backend: `POST /api/leads` saves the lead AND idempotently upserts to subscribers list
- ✅ Admin: new "Leads" tab + "Leads" stat card showing email, name, goal, source/cta, captured-at
- ✅ All 7 entry points covered

## Smart Investing Flagship Gateway (2026-05-17)
- ✅ New internal `/smart-investing` flagship landing page — feels like the Keystone-dedicated experience inside the CrLuys ecosystem
- ✅ Cinematic hero "Financial Freedom Changes Everything." with 4 stats grid, 5-star trust, dual CTAs
- ✅ Sections: Inner Circle (4 pillars), How It Works (3 steps), Member Testimonials (3 cards w/ result chips), Inline Apply form (goal chips + email + name) → opens external Keystone in new tab via window.open after lead capture, FAQ (5 items), Final CTA strip
- ✅ All Smart Investing entry points now navigate INTERNALLY to /smart-investing (header nav, hero pill with "Flagship" badge, hero CTA "Start Your Transformation", footer link with "Flagship" badge, mobile menu, FeaturedFinancialSection 3 CTAs, search results, /category/smart-investing redirect, /product/keystone-* redirect)
- ✅ Only the CTAs ON the /smart-investing page open the lead-capture modal → external Keystone in new tab
- ✅ Other 4 categories (Health, Fitness, Self Sufficiency, Mindset) untouched
- ✅ Frontend tested by agent: 100% (24/24) ✅

## Default Admin Credentials
- Email: `admin@crluys.com`
- Password: `CrLuys2026!`
- Admin URL: `/admin/login`

## Prioritized Backlog
### P0 (delivered)
- Homepage, 5 categories, product pages, admin CRUD, newsletter, contact, auth

### P1 (next)
- Replace placeholder affiliate URLs (admin can edit each product to set the real partner URL)
- Optional: stronger SEO (Open Graph tags per product, sitemap.xml)
- Optional: rate-limit on newsletter & contact endpoints

### P2 (future)
- Stripe checkout for first-party digital products
- Multi-language (EN/ES) toggle
- Brute-force lockout on `/api/auth/login` (5 failed = 15 min)
- Email integration for "new subscriber" + "new message" notifications (Resend / SendGrid)

## Next Tasks (suggested)
- Plug in real affiliate URLs via Admin → Products → Edit
- Optional: add Stripe-based premium membership tier
- Optional: integrate Resend for transactional emails
- Optional: connect to analytics for conversion tracking on affiliate clicks
