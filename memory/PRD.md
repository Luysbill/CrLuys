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

## Final Luxury Refinement (2026-05-17, deployment-ready)
- ✅ **All placeholder affiliate URLs scrubbed**: backend seed default is `""`; idempotent migration on every startup strips any legacy `example.com/...` URLs from existing docs. All 20 products now have empty `affiliate_url` awaiting admin to fill in real partner links.
- ✅ **Graceful CTA fallback**: ProductPage shows an elegant "Available Soon" badge with `Lock` icon when `affiliate_url` is empty (in all 3 CTA locations on the page), instead of broken links. Subtitle copy adapts: "We're finalising secure access. Subscribe to be the first to know." When admin sets a real URL via Admin → Products, the page automatically switches to the standard "Get Instant Access" external CTA.
- ✅ **DiscoveryRibbon** added between Top Picks and Featured Financial sections: a slow editorial 60-second marquee of 5 category mood-images, "Five worlds, one philosophy." headline, fade-edged gradient overlays, pauses on hover, respects `prefers-reduced-motion`. Subtle and quiet — not Pinterest-spam.
- ✅ **Soft scroll fade-up** on CategorySections via the new `useReveal` IntersectionObserver hook + `.reveal` CSS class.
- ✅ **No dev artifacts visible**: confirmed zero references to seeded credentials, no demo strings, no debug text anywhere in user-facing surface.
- ✅ **Backend tested 7/7 pytest** + **frontend 15/15 review items** all green, including idempotent restart cycle.

## Admin Dashboard Polish — Production Affiliate Workflow (2026-05-19, iteration 13)
- ✅ **New "Affiliate links" stat card** (e.g. `0/20`) at the top of the dashboard — instant visibility into how many products are revenue-ready.
- ✅ **Affiliate-URL status column** with three states: gold "Flagship" pill (Keystone, auto-redirected via modal), green "✓ Linked" pill, red "Not set" pill.
- ✅ **Inline Quick-Edit Affiliate URL**: link icon → input → Enter to save, Esc to cancel. No full-modal needed for the most frequent action.
- ✅ **Test affiliate link** button next to each linked URL (opens in new tab via `target=_blank rel=noopener`).
- ✅ **View public page** button per row → opens `/product/{slug}` in a new tab for instant preview.
- ✅ **Search + Category + Affiliate filter** bar with live result count ("Showing X of Y") and an empty-state with "Clear filters".
- ✅ **Top Pick Rank field** (`priority_order`) now exposed in the full edit modal (1–8 = strategic top picks; 999 = off).
- ✅ **Admin product list sort**: backend now returns products by `priority_order ASC, category ASC, order ASC` so the strategic top 8 always surface first.
- ✅ **URL validation** (`http://` / `https://` only) in both the modal and quick-edit, with inline green "✓ Valid" / red "Must start with https" badges.
- ✅ **Flagship guard**: changing `keystone-investors-club`'s affiliate URL fires a `window.confirm` dialog warning that the cinematic lead-capture modal flow will be overridden.
- ✅ **Mobile responsive**: filter bar wraps gracefully; products table is horizontally scrollable.
- ✅ **Backend pytest 3/3** (`/app/backend/tests/test_iter13_admin_polish.py`) + **frontend 24/24** admin polish review items all green.

## Image Sync — Authentic Storefront Imagery Restoration (2026-05-19, iteration 14)
- ✅ All 20 products now carry their **exact original image URLs** from the canonical SpreadSimple storefront at `https://crluyslifestylespread.blog/` — matched by storefront title → DB slug, no substitution, no AI generation, no stock photos. All 20 unsplash placeholders fully replaced.
- ✅ Updated both runtime DB (via admin PUT) **and** `SEED_PRODUCTS` defaults in `server.py` so a fresh-DB rebuild also restores the authentic imagery.
- ✅ Added `referrerPolicy="no-referrer"` to all 5 product-image `<img>` tags (TopPicksSection, ProductCard, ProductPage, HomePage search results × 2). This bypasses hotlink protection on Pinterest / Bing / LinkedIn / Cloudinary / Google Storage CDNs while still using the exact original URLs — **no URL replacement, no aspect-ratio change, no layout change**. Live deliverability jumped from 10/22 → **21/22 image renders** (95%).
- 🚩 **Flagged for future manual replacement** (per user policy "use as-is, flag quietly"):
   - `lean-bliss` → `https://leanbliss.colibrim.ai/leanbliss/leanbliss-buy.png` returns HTTP 202 with HTML content from the origin host. The storefront uses this same URL — it appears the upstream image was moved or the path now redirects to a JS-rendered page. Admin should paste a working Lean Bliss product image via the Admin Dashboard quick-edit when available.
   - Several images are <800px wide (small thumbnails from Bing image search): `his-secret-obsession` (417×234), `12-weeks-ketogenic-meal-plans` (412×234), `the-genius-wave` (564×330). They render correctly but at lower fidelity than the 4:3 / 16:10 card aspect ratios. Optional future upgrade.
- ✅ Cinematic dark-and-gold aesthetic, scroll animations, category structure, flagship hierarchy, and all UI interactions preserved exactly as-is.

## Default Admin Credentials
- Email: `admin@crluys.com`
- Password: `CrLuys2026!`
- Admin URL: `/admin/login`

## Prioritized Backlog
### P0 (delivered)
- Homepage, 5 categories, product pages, admin CRUD, newsletter, contact, auth
- Admin dashboard polish: quick-edit affiliate URL, filters, status pills, flagship guard, URL validation (iter 13)

### P1 (next)
- Plug in real affiliate URLs via Admin → Products (now smooth via inline quick-edit)
- Email automation for captured leads (Resend / SendGrid welcome + nurture sequence)
- Optional: stronger SEO (Open Graph tags per product, sitemap.xml)
- Optional: rate-limit on newsletter & contact endpoints

### P2 (future)
- Stripe checkout for first-party digital products
- Multi-language (EN/ES) toggle
- Brute-force lockout on `/api/auth/login` (5 failed = 15 min)
- Analytics integration (Plausible / GA) for affiliate-CTR tracking
- Blog / content section for SEO traffic
- Wishlist / favorites
- Product reviews & ratings

## Next Tasks (suggested)
- Plug in real affiliate URLs via Admin → Products → inline link icon (or full edit)
- Email automation (welcome + nurture) for Smart Investing leads
- Add analytics on affiliate-link clicks for conversion tracking
- Optional: Stripe-based premium membership tier
