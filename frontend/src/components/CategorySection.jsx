import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, HeartPulse, Dumbbell, Leaf, Brain } from "lucide-react";
import ProductCard from "./ProductCard";
import { CATEGORY_IMAGES } from "../lib/api";

const ICON_MAP = { TrendingUp, HeartPulse, Dumbbell, Leaf, Brain };

export default function CategorySection({ category, products, reverse = false }) {
    const Icon = ICON_MAP[category.icon] || TrendingUp;
    const featured = products.filter((p) => p.featured).slice(0, 1);
    const grid = products
        .filter((p) => !featured.find((f) => f.id === p.id))
        .slice(0, 3);

    return (
        <section
            id={`category-${category.slug}`}
            data-testid={`category-section-${category.slug}`}
            className="relative py-28 md:py-40 overflow-hidden"
        >
            <span
                className="category-watermark absolute -top-10 right-[-2rem] md:right-[-3rem] text-[28vw] md:text-[20vw] hidden md:block"
                aria-hidden
            >
                {category.number}
            </span>

            <div className="relative max-w-7xl mx-auto px-6 md:px-12">
                <div
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center mb-16 ${
                        reverse ? "lg:[direction:rtl]" : ""
                    }`}
                >
                    <div className={`lg:col-span-5 ${reverse ? "[direction:ltr]" : ""}`}>
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
                            <img
                                src={CATEGORY_IMAGES[category.slug]}
                                alt={category.name}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <p className="text-xs uppercase tracking-[0.4em] text-gold/90 mb-2">
                                    {category.number} · Lifestyle
                                </p>
                                <p className="font-serif text-3xl text-cream italic">
                                    {category.tagline}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`lg:col-span-7 ${reverse ? "[direction:ltr]" : ""}`}>
                        <div className="inline-flex items-center gap-3 mb-6">
                            <span className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-gold/40 bg-ink-50">
                                <Icon className="h-4 w-4 text-gold" />
                            </span>
                            <span className="text-xs uppercase tracking-[0.4em] text-gold">
                                {category.number} — Curated Collection
                            </span>
                        </div>
                        <h2 className="font-serif text-5xl md:text-6xl text-cream leading-[0.95] mb-6 tracking-tight">
                            {category.name.split(" & ")[0]}
                            {category.name.includes(" & ") && (
                                <>
                                    <br />
                                    <span className="italic gold-gradient-text">
                                        & {category.name.split(" & ").slice(1).join(" & ")}
                                    </span>
                                </>
                            )}
                        </h2>
                        <p className="text-cream/65 text-lg font-light leading-relaxed mb-8 max-w-xl">
                            {category.description}
                        </p>
                        <Link
                            to={`/category/${category.slug}`}
                            data-testid={`category-cta-${category.slug}`}
                            className="inline-flex items-center gap-3 px-7 py-4 rounded-full border border-gold/40 text-cream hover:text-ink hover:bg-gold transition-all duration-500 group"
                        >
                            <span className="text-sm uppercase tracking-[0.3em]">
                                Open Collection
                            </span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {(featured.length > 0 || grid.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {[...featured, ...grid].map((p, i) => (
                            <ProductCard key={p.id} product={p} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
