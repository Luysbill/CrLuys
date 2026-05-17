import React from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
import { CATEGORIES } from "../lib/api";

export default function ProductCard({ product, index = 0 }) {
    const cat = CATEGORIES.find((c) => c.slug === product.category);
    return (
        <Link
            to={`/product/${product.slug}`}
            data-testid={`product-card-${product.slug}`}
            className="group relative flex flex-col bg-ink-100 border border-gold/15 rounded-2xl overflow-hidden hover-glow transition-all duration-700 hover:border-gold/40 hover:-translate-y-1"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-ink-50">
                <img
                    src={product.image_url}
                    alt={product.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                {product.start_here && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] bg-gold text-ink font-medium">
                        Start Here
                    </span>
                )}
                {product.featured && !product.start_here && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] bg-ink/80 border border-gold/40 text-gold font-medium backdrop-blur-md">
                        Featured
                    </span>
                )}
                {cat && (
                    <span className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.2em] text-cream/70 font-light">
                        {cat.number}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-1 mb-2 star-gold">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5" />
                    ))}
                    <span className="ml-2 text-xs text-cream/60">
                        {product.rating?.toFixed(1) || "4.9"} · {product.reviews_count || 0} reviews
                    </span>
                </div>

                <h3 className="font-serif text-2xl text-cream leading-tight tracking-tight mb-2">
                    {product.title}
                </h3>
                <p className="text-sm text-cream/65 font-light leading-relaxed mb-5 line-clamp-3">
                    {product.short_description}
                </p>

                <div className="mt-auto flex items-end justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-cream/40">
                            From
                        </p>
                        <p className="font-serif text-2xl text-gold">
                            ${product.price?.toFixed(2)}
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-gold group-hover:translate-x-1 transition-transform duration-500">
                        Explore <ArrowRight className="h-4 w-4" />
                    </span>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </Link>
    );
}
