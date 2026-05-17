import React from "react";
import { ArrowRight, Star, ShieldCheck } from "lucide-react";
import { HERO_IMAGE, CATEGORIES } from "../lib/api";

export default function Hero() {
    const scrollTo = (slug) => {
        const el = document.getElementById(`category-${slug}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <section
            data-testid="hero-section"
            className="relative min-h-[100svh] w-full overflow-hidden flex items-end pb-24 pt-40"
        >
            <div className="absolute inset-0">
                <img
                    src={HERO_IMAGE}
                    alt="CrLuys Lifestyle hero"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="absolute inset-0 bg-noise opacity-30" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 md:px-12 w-full">
                <div className="max-w-3xl animate-fade-up">
                    <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full glass">
                        <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                        <span className="text-[11px] uppercase tracking-[0.35em] text-cream/85">
                            A Premium Lifestyle Ecosystem
                        </span>
                    </div>

                    <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream leading-[0.92] tracking-tighter font-light">
                        Elevate Your{" "}
                        <span className="italic gold-gradient-text">Health.</span>
                        <br />
                        Elevate Your{" "}
                        <span className="italic gold-gradient-text">Life.</span>
                    </h1>

                    <p className="mt-8 text-cream/75 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                        Curated lifestyle resources for those who refuse to settle —
                        wellness, financial freedom, fitness, mindset & intentional living,
                        in one cinematic ecosystem.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            data-testid="hero-cta-start"
                            onClick={() => scrollTo(CATEGORIES[0].slug)}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gold text-ink hover:bg-gold-light transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] group"
                        >
                            <span className="text-sm uppercase tracking-[0.3em] font-medium">
                                Start Your Transformation
                            </span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a
                            href="#trust"
                            data-testid="hero-cta-trust"
                            className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-gold/40 text-cream hover:text-gold transition-colors"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-sm uppercase tracking-[0.3em]">
                                Why CrLuys
                            </span>
                        </a>
                    </div>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex items-center gap-1 star-gold">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4" />
                            ))}
                        </div>
                        <p className="text-sm text-cream/70 font-light">
                            Trusted by thousands of lifestyle seekers worldwide.
                        </p>
                    </div>
                </div>

                <div
                    className="mt-14 lg:mt-20 relative animate-fade-up"
                    style={{ animationDelay: "0.4s" }}
                    data-testid="hero-category-rail"
                >
                    <p className="text-[10px] uppercase tracking-[0.5em] text-gold/80 mb-4">
                        Five Pillars · Choose Yours
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c.slug}
                                type="button"
                                data-testid={`hero-category-pill-${c.slug}`}
                                onClick={() => scrollTo(c.slug)}
                                className="group inline-flex items-center gap-3 px-5 py-3 rounded-full glass border border-gold/25 hover:border-gold transition-all duration-500 hover-glow"
                            >
                                <span className="text-[10px] font-serif italic text-gold/70 group-hover:text-gold">
                                    {c.number}
                                </span>
                                <span className="text-sm tracking-wide text-cream group-hover:text-gold">
                                    {c.short}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
