import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Sparkles, TrendingUp, Star } from "lucide-react";
import { CATEGORIES } from "../lib/api";
import { useKeystoneOnboarding } from "../lib/keystone-onboarding";

function PriorityCard({ product, rank }) {
    const cat = CATEGORIES.find((c) => c.slug === product.category);
    const { openOnboarding } = useKeystoneOnboarding();
    const isFlagship = rank === 1;
    const external = cat?.external_url;

    const content = (
        <>
            {/* Rank ribbon */}
            <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                <span
                    className={`font-serif italic text-3xl leading-none ${
                        isFlagship ? "gold-gradient-text" : "text-gold/85"
                    }`}
                >
                    #{rank}
                </span>
                {isFlagship && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-[0.3em] bg-gold text-ink font-medium">
                        Flagship
                    </span>
                )}
            </div>

            <div className="absolute top-5 right-5 z-10 text-[10px] uppercase tracking-[0.3em] text-cream/55">
                {cat?.number}
            </div>

            <div className="relative aspect-[16/10] overflow-hidden bg-ink-50">
                <img
                    src={product.image_url}
                    alt={product.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
            </div>

            <div className="flex flex-1 flex-col p-7">
                <p className="text-[10px] uppercase tracking-[0.35em] text-gold/80 mb-3">
                    {cat?.short}
                </p>
                <h3
                    className={`font-serif leading-tight tracking-tight mb-3 ${
                        isFlagship ? "text-3xl text-cream" : "text-2xl text-cream"
                    }`}
                >
                    {product.title}
                </h3>
                <p className="text-sm text-cream/65 font-light leading-relaxed mb-5 line-clamp-3">
                    {product.short_description}
                </p>

                <div className="mt-auto flex items-end justify-between gap-3">
                    <div className="flex items-center gap-1 star-gold">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5" />
                        ))}
                        <span className="ml-2 text-xs text-cream/55">
                            {product.rating?.toFixed(1) || "4.9"}
                        </span>
                    </div>
                    <span
                        className={`inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] transition-transform duration-500 group-hover:translate-x-1 ${
                            isFlagship ? "text-gold" : "text-gold/90"
                        }`}
                    >
                        {isFlagship ? "Enter Vault" : "Open"}
                        {isFlagship ? (
                            <ArrowUpRight className="h-4 w-4" />
                        ) : (
                            <ArrowRight className="h-4 w-4" />
                        )}
                    </span>
                </div>
            </div>
        </>
    );

    const className = `group relative flex flex-col bg-ink-100 border rounded-3xl overflow-hidden transition-all duration-700 hover:-translate-y-1 ${
        isFlagship
            ? "border-gold/45 hover:border-gold shadow-[0_0_24px_rgba(212,175,55,0.18)] hover:shadow-[0_0_36px_rgba(212,175,55,0.32)]"
            : "border-gold/15 hover:border-gold/45"
    } ${isFlagship ? "md:col-span-2" : ""}`;

    if (external) {
        return (
            <button
                type="button"
                onClick={() =>
                    openOnboarding(external, `top-picks-${product.slug}`)
                }
                data-testid={`top-pick-${product.slug}`}
                className={className + " text-left"}
            >
                {content}
            </button>
        );
    }

    return (
        <Link
            to={`/product/${product.slug}`}
            data-testid={`top-pick-${product.slug}`}
            className={className}
        >
            {content}
        </Link>
    );
}

export default function TopPicksSection({ products = [] }) {
    if (!products.length) return null;
    return (
        <section
            data-testid="top-picks-section"
            className="relative py-20 md:py-32 lg:py-36 overflow-hidden"
        >
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 -right-32 h-[400px] w-[400px] rounded-full bg-gold/10 blur-[140px] pointer-events-none" />
            </div>
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-end mb-12 md:mb-16">
                    <div className="lg:col-span-7">
                        <div className="inline-flex items-center gap-3 mb-5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass">
                            <TrendingUp className="h-3.5 w-3.5 text-gold" />
                            <span className="text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-gold/95">
                                Strategic Top Picks · Curated by engagement
                            </span>
                        </div>
                        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream leading-[0.95] tracking-tighter">
                            The eight that
                            <br />
                            <span className="italic gold-gradient-text">
                                changed lifestyles
                            </span>
                            .
                        </h2>
                    </div>
                    <div className="lg:col-span-5">
                        <p className="text-cream/70 font-light text-lg leading-relaxed max-w-xl">
                            Our top picks — ranked by real engagement, outbound clicks and
                            curated audience curiosity. Each one is a doorway into a
                            different chapter of your lifestyle transformation.
                        </p>
                        <div className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-cream/45">
                            <Sparkles className="h-3 w-3 text-gold" />
                            Driven by Pinterest analytics
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
                    {products.map((p) => (
                        <PriorityCard key={p.id} product={p} rank={p.priority_order} />
                    ))}
                </div>
            </div>
        </section>
    );
}
