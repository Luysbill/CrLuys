import React from "react";
import {
    ArrowRight,
    ArrowUpRight,
    TrendingUp,
    Sparkles,
    ShieldCheck,
    ChevronRight,
} from "lucide-react";
import { SMART_INVESTING_EXTERNAL_URL, CATEGORY_IMAGES } from "../lib/api";
import { useKeystoneOnboarding } from "../lib/keystone-onboarding";

const PILLARS = [
    {
        n: "01",
        title: "Smarter Investing Frameworks",
        text: "Disciplined, data-driven strategies refined by veteran portfolio managers.",
    },
    {
        n: "02",
        title: "Curated Wealth Opportunities",
        text: "Vetted private equity, alternative assets and global plays usually reserved for institutions.",
    },
    {
        n: "03",
        title: "Clarity & Confidence",
        text: "Senior advisors, peers and tools that keep you focused through every market cycle.",
    },
];

const STATS = [
    { value: "12,400+", label: "Members worldwide" },
    { value: "$2.4B", label: "Portfolio insights" },
    { value: "+18.7%", label: "Annualised return" },
    { value: "7.3 yrs", label: "Average tenure" },
];

export default function FeaturedFinancialSection() {
    const { openOnboarding } = useKeystoneOnboarding();
    return (
        <section
            id="category-smart-investing"
            data-testid="featured-financial-section"
            className="relative py-24 md:py-32 lg:py-40 overflow-hidden"
        >
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <img
                    src={CATEGORY_IMAGES["smart-investing"]}
                    alt="Smart Investing"
                    className="absolute inset-0 h-full w-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
                <div className="absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-gold/15 blur-[140px]" />
                <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gold/10 blur-[140px]" />
            </div>

            <span
                className="category-watermark absolute -top-10 right-[-2rem] md:right-[-3rem] text-[28vw] md:text-[20vw] hidden md:block"
                aria-hidden
            >
                01
            </span>

            <div className="relative max-w-7xl mx-auto px-6 md:px-12">
                {/* Tag */}
                <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full glass">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                    <span className="text-[10px] uppercase tracking-[0.45em] text-gold/95">
                        01 · The Featured Pillar · Private Investors Circle
                    </span>
                </div>

                {/* Headline */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end mb-16">
                    <div className="lg:col-span-7">
                        <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] text-cream leading-[0.95] md:leading-[0.92] tracking-tighter">
                            Financial Freedom
                            <br />
                            <span className="italic gold-gradient-text">
                                Changes Everything.
                            </span>
                        </h2>
                    </div>
                    <div className="lg:col-span-5">
                        <p className="text-cream/75 text-lg font-light leading-relaxed max-w-xl">
                            The Smart Investing pillar of CrLuys is powered by
                            <span className="text-gold"> Keystone Investors Club</span> — a
                            private circle for serious wealth builders. Curated strategies,
                            vetted opportunities and senior advisors, all in one elegant
                            destination.
                        </p>
                    </div>
                </div>

                {/* Three pillars */}
                <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-14"
                    data-testid="featured-pillars"
                >
                    {PILLARS.map((p) => (
                        <div
                            key={p.n}
                            className="group relative bg-ink-100/70 backdrop-blur-md border border-gold/20 rounded-3xl p-7 hover:border-gold/55 transition-all duration-500 overflow-hidden"
                        >
                            <div className="absolute -top-12 -right-12 h-32 w-32 bg-gold/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <p className="font-serif italic text-gold text-sm mb-4">
                                {p.n} — Pillar
                            </p>
                            <h3 className="font-serif text-2xl text-cream leading-tight mb-3 tracking-tight">
                                {p.title}
                            </h3>
                            <p className="text-cream/65 font-light leading-relaxed text-[15px]">
                                {p.text}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA + Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    <div className="lg:col-span-7">
                        <div className="bg-ink-100/80 backdrop-blur-md border border-gold/30 rounded-3xl p-8 md:p-10 relative overflow-hidden hover:border-gold/60 transition-colors">
                            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gold/15 blur-[80px]" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="h-4 w-4 text-gold" />
                                    <span className="text-[10px] uppercase tracking-[0.45em] text-gold/90">
                                        By Invitation
                                    </span>
                                </div>
                                <h3 className="font-serif text-3xl md:text-4xl text-cream leading-snug mb-3 tracking-tight">
                                    A private circle, not a platform.
                                </h3>
                                <p className="text-cream/65 font-light mb-7 max-w-xl">
                                    Request a private invitation to Keystone Investors Club —
                                    strategies, deals and advisors designed for the long arc
                                    of your wealth.
                                </p>
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openOnboarding(
                                                SMART_INVESTING_EXTERNAL_URL,
                                                "featured-enter-the-vault"
                                            )
                                        }
                                        data-testid="featured-financial-primary-cta"
                                        className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-gold text-ink hover:bg-gold-light transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] group"
                                    >
                                        <span className="text-sm uppercase tracking-[0.3em] font-medium">
                                            Enter The Vault
                                        </span>
                                        <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openOnboarding(
                                                SMART_INVESTING_EXTERNAL_URL,
                                                "featured-why-keystone"
                                            )
                                        }
                                        data-testid="featured-financial-secondary-cta"
                                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-gold/40 text-cream hover:text-gold hover:border-gold transition-colors"
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        <span className="text-sm uppercase tracking-[0.3em]">
                                            Why Keystone
                                        </span>
                                    </button>
                                </div>
                                <p className="text-xs text-cream/45 mt-5">
                                    Application reviewed within 48 hours · Strictly
                                    confidential
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="grid grid-cols-2 gap-4" data-testid="featured-stats">
                            {STATS.map((s) => (
                                <div
                                    key={s.label}
                                    className="bg-ink-50/60 border border-gold/15 rounded-2xl p-5 hover:border-gold/40 transition-colors"
                                >
                                    <p className="font-serif text-3xl md:text-4xl gold-gradient-text leading-tight">
                                        {s.value}
                                    </p>
                                    <p className="text-[11px] uppercase tracking-[0.25em] text-cream/60 mt-1">
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-cream/45 mt-5 flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-gold" />
                            As referenced in Bloomberg · Financial Times · Forbes
                        </p>
                    </div>
                </div>

                {/* Link strip — direct handoff to Keystone */}
                <button
                    type="button"
                    onClick={() =>
                        openOnboarding(
                            SMART_INVESTING_EXTERNAL_URL,
                            "featured-link-strip"
                        )
                    }
                    data-testid="featured-financial-link-strip"
                    className="group mt-14 w-full flex items-center justify-between bg-ink-50/60 border border-gold/20 rounded-full px-7 py-4 hover:border-gold transition-colors text-left"
                >
                    <span className="text-cream/80 text-sm tracking-[0.2em] uppercase">
                        Explore the Smart Investing destination
                    </span>
                    <span className="inline-flex items-center gap-2 text-gold">
                        <span className="text-sm uppercase tracking-[0.3em] font-medium">
                            Open
                        </span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
            </div>
        </section>
    );
}
