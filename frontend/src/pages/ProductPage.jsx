import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    Star,
    Sparkles,
    Lock,
    BadgeCheck,
    Check,
    ExternalLink,
} from "lucide-react";
import { apiClient, CATEGORIES } from "../lib/api";
import TestimonialGrid from "../components/TestimonialGrid";
import FAQAccordion from "../components/FAQAccordion";
import NewsletterCTA from "../components/NewsletterCTA";

export default function ProductPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        window.scrollTo(0, 0);
        (async () => {
            try {
                const { data } = await apiClient.get(`/products/${slug}`);
                const cat = CATEGORIES.find((c) => c.slug === data.category);
                if (cat?.internal_path) {
                    navigate(cat.internal_path, { replace: true });
                    return;
                }
                setProduct(data);
            } catch (err) {
                setError("Product not found");
            } finally {
                setLoading(false);
            }
        })();
    }, [slug, navigate]);

    if (loading) {
        return (
            <main className="pt-40 text-center text-cream/70">Loading…</main>
        );
    }
    if (error || !product) {
        return (
            <main className="pt-40 text-center px-6">
                <p className="text-cream">Product not found.</p>
                <Link to="/" className="text-gold mt-4 inline-block">
                    Back home
                </Link>
            </main>
        );
    }

    const category = CATEGORIES.find((c) => c.slug === product.category);
    const cta = (
        <a
            href={product.affiliate_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="product-affiliate-cta"
            className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-9 py-4 rounded-full bg-gold text-ink hover:bg-gold-light transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] group"
        >
            <span className="text-sm uppercase tracking-[0.3em] font-medium">
                Get Instant Access
            </span>
            <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </a>
    );

    return (
        <main data-testid="product-page" className="pt-32">
            {/* Hero / split landing */}
            <section className="relative py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <Link
                        to={`/category/${product.category}`}
                        className="inline-flex items-center gap-2 text-cream/60 hover:text-gold transition-colors mb-10 text-xs uppercase tracking-[0.3em]"
                        data-testid="product-back-link"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to {category?.short}
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                        <div className="lg:col-span-6 lg:sticky lg:top-28">
                            <div className="relative aspect-square rounded-3xl overflow-hidden border border-gold/15 bg-ink-50">
                                <img
                                    src={product.image_url}
                                    alt={product.title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                                {product.start_here && (
                                    <span className="absolute top-5 left-5 inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.25em] bg-gold text-ink font-medium">
                                        Start Here
                                    </span>
                                )}
                            </div>
                            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                                {[
                                    { icon: ShieldCheck, label: "Money-back" },
                                    { icon: Lock, label: "Secure checkout" },
                                    { icon: BadgeCheck, label: "Verified partner" },
                                ].map((b) => (
                                    <div
                                        key={b.label}
                                        className="bg-ink-100 border border-gold/15 rounded-xl py-4 px-2"
                                    >
                                        <b.icon className="h-4 w-4 text-gold mx-auto mb-2" />
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-cream/65">
                                            {b.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-6 space-y-7">
                            <p className="text-[11px] uppercase tracking-[0.5em] text-gold/85">
                                {category?.number} · {category?.short}
                            </p>
                            <h1 className="font-serif text-5xl md:text-6xl text-cream leading-[0.95] tracking-tight">
                                {product.title}
                            </h1>
                            {product.headline && (
                                <p className="font-serif italic text-2xl md:text-3xl gold-gradient-text leading-snug">
                                    {product.headline}
                                </p>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1 star-gold">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4" />
                                    ))}
                                </div>
                                <span className="text-cream/70 font-light">
                                    {product.rating?.toFixed(1) || "4.9"} ·{" "}
                                    {product.reviews_count || 0} verified reviews
                                </span>
                            </div>

                            <p className="text-cream/70 font-light text-lg leading-relaxed">
                                {product.long_description || product.short_description}
                            </p>

                            <div className="flex items-end gap-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-cream/45">
                                        Investment
                                    </p>
                                    <p className="font-serif text-5xl text-gold">
                                        ${product.price?.toFixed(2)}
                                    </p>
                                </div>
                                {product.original_price &&
                                    product.original_price > product.price && (
                                        <p className="text-cream/45 line-through pb-2">
                                            ${product.original_price?.toFixed(2)}
                                        </p>
                                    )}
                            </div>

                            <div className="pt-2">{cta}</div>
                            <p className="text-xs text-cream/45">
                                Opens secure partner page · External affiliate link in new tab
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            {product.benefits?.length > 0 && (
                <section
                    data-testid="product-benefits"
                    className="relative py-24 border-y border-gold/15 bg-ink-50/40"
                >
                    <div className="max-w-6xl mx-auto px-6 md:px-12">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                            <div className="md:col-span-4">
                                <p className="text-[11px] uppercase tracking-[0.5em] text-gold/85 mb-4">
                                    The Benefit
                                </p>
                                <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight">
                                    What it does for{" "}
                                    <span className="italic gold-gradient-text">you</span>.
                                </h2>
                            </div>
                            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {product.benefits.map((b, i) => (
                                    <div
                                        key={i}
                                        data-testid={`product-benefit-${i}`}
                                        className="flex items-start gap-4 bg-ink-100 border border-gold/15 rounded-2xl p-5 hover:border-gold/35 transition-colors"
                                    >
                                        <span className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-gold/15 border border-gold/40 text-gold shrink-0">
                                            <Check className="h-4 w-4" />
                                        </span>
                                        <p className="text-cream font-light leading-relaxed">
                                            {b}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Mid CTA */}
            <section className="relative py-24">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <Sparkles className="h-6 w-6 text-gold mx-auto mb-4" />
                    <h3 className="font-serif text-3xl md:text-5xl text-cream leading-tight mb-6">
                        Ready to{" "}
                        <span className="italic gold-gradient-text">elevate</span> today?
                    </h3>
                    <p className="text-cream/65 font-light mb-8">
                        Join thousands who chose intentional living. Your transformation
                        begins at the click of a button.
                    </p>
                    {cta}
                </div>
            </section>

            <TestimonialGrid testimonials={product.testimonials} />
            <FAQAccordion items={product.faq} />

            {/* Final CTA */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-ink-50 via-ink to-ink-50" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gold/10 blur-[100px]" />
                </div>
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gold/85 mb-4">
                        Your invitation
                    </p>
                    <h2 className="font-serif text-4xl md:text-6xl text-cream leading-[1.05] mb-6">
                        The best version of you is{" "}
                        <span className="italic gold-gradient-text">waiting</span>.
                    </h2>
                    <p className="text-cream/65 font-light mb-10 max-w-xl mx-auto">
                        Curated by experts. Loved worldwide. Backed by satisfaction
                        guarantees. {product.title} is ready when you are.
                    </p>
                    {cta}
                </div>
            </section>

            <NewsletterCTA />
        </main>
    );
}
