import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, Star, ArrowLeft, ArrowUpRight } from "lucide-react";
import { apiClient, CATEGORIES, CATEGORY_IMAGES } from "../lib/api";
import { useKeystoneOnboarding } from "../lib/keystone-onboarding";
import ProductCard from "../components/ProductCard";
import NewsletterCTA from "../components/NewsletterCTA";
import TestimonialGrid from "../components/TestimonialGrid";

export default function CategoryPage() {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { openOnboarding } = useKeystoneOnboarding();

    const category = CATEGORIES.find((c) => c.slug === slug);

    // For external-destination categories (Smart Investing), auto-open onboarding modal
    useEffect(() => {
        if (category?.external_url) {
            const t = setTimeout(
                () =>
                    openOnboarding(
                        category.external_url,
                        `category-page-${category.slug}`
                    ),
                500
            );
            return () => clearTimeout(t);
        }
    }, [category, openOnboarding]);

    useEffect(() => {
        if (category?.external_url) {
            setLoading(false);
            return;
        }
        setLoading(true);
        (async () => {
            try {
                const { data } = await apiClient.get("/products", {
                    params: { category: slug },
                });
                setProducts(data);
            } finally {
                setLoading(false);
            }
        })();
    }, [slug, category]);

    if (!category) {
        return (
            <main className="pt-40 min-h-[60vh] text-center px-6">
                <p className="text-cream">Category not found.</p>
                <Link to="/" className="text-gold mt-4 inline-block">
                    Back home
                </Link>
            </main>
        );
    }

    // Cinematic handoff page for external-destination categories
    if (category.external_url) {
        return (
            <main
                data-testid="category-external-redirect"
                className="min-h-screen pt-32 pb-32 flex items-center justify-center relative overflow-hidden"
            >
                <div className="absolute inset-0 -z-10">
                    <img
                        src={CATEGORY_IMAGES[category.slug]}
                        alt={category.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/40" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gold/15 blur-[120px]" />
                </div>
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full glass">
                        <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.45em] text-gold/95">
                            {category.number} · The Flagship Pillar
                        </span>
                    </div>
                    <h1 className="font-serif text-5xl md:text-7xl text-cream leading-[0.95] mb-6 tracking-tight">
                        Financial Freedom
                        <br />
                        <span className="italic gold-gradient-text">
                            Changes Everything.
                        </span>
                    </h1>
                    <p className="text-cream/70 font-light text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                        Opening your Keystone Investors Club destination — your private
                        Smart Investing experience.
                    </p>
                    <button
                        type="button"
                        onClick={() =>
                            openOnboarding(
                                category.external_url,
                                `category-handoff-${category.slug}`
                            )
                        }
                        data-testid="category-external-cta"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gold text-ink hover:bg-gold-light transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] group"
                    >
                        <span className="text-sm uppercase tracking-[0.3em] font-medium">
                            Open Keystone
                        </span>
                        <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                    <p className="text-xs text-cream/45 mt-6">
                        Brief onboarding · Opens in a new tab
                    </p>
                    <Link
                        to="/"
                        data-testid="category-external-back"
                        className="mt-10 inline-flex items-center gap-2 text-cream/55 hover:text-gold transition-colors text-xs uppercase tracking-[0.3em]"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to ecosystem
                    </Link>
                </div>
            </main>
        );
    }

    const startHere = products.filter((p) => p.start_here).slice(0, 3);
    const featured = products.filter((p) => p.featured);
    const rest = products.filter((p) => !p.featured && !p.start_here);

    return (
        <main data-testid="category-page" className="pt-32">
            {/* Hero */}
            <section
                data-testid="category-hero"
                className="relative min-h-[60vh] flex items-end pb-20 overflow-hidden"
            >
                <div className="absolute inset-0 -z-10">
                    <img
                        src={CATEGORY_IMAGES[slug]}
                        alt={category.name}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
                </div>
                <div className="relative max-w-7xl mx-auto px-6 md:px-12 w-full">
                    <Link
                        to="/"
                        data-testid="category-back-link"
                        className="inline-flex items-center gap-2 text-cream/65 hover:text-gold transition-colors mb-6 text-xs uppercase tracking-[0.3em]"
                    >
                        <ArrowLeft className="h-4 w-4" /> All Categories
                    </Link>
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gold/85 mb-4">
                        Collection {category.number}
                    </p>
                    <h1 className="font-serif text-5xl md:text-7xl text-cream leading-[0.95] mb-5 tracking-tighter">
                        {category.name}
                    </h1>
                    <p className="text-cream/70 font-light text-lg max-w-2xl leading-relaxed">
                        {category.description}
                    </p>
                </div>
            </section>

            {/* Start Here */}
            {startHere.length > 0 && (
                <section
                    data-testid="start-here-section"
                    className="relative py-20"
                >
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="flex items-center gap-3 mb-10">
                            <Sparkles className="h-5 w-5 text-gold" />
                            <p className="text-xs uppercase tracking-[0.5em] text-gold/90">
                                Start Here · Hand-picked
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {startHere.map((p, i) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Benefits / Why this collection */}
            <section
                data-testid="category-benefits"
                className="relative py-24 border-y border-gold/15 bg-ink-50/40"
            >
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.5em] text-gold/85 mb-3">
                                Why this collection
                            </p>
                            <h2 className="font-serif text-3xl md:text-4xl text-cream italic">
                                {category.tagline}
                            </h2>
                        </div>
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: "Curated, never random",
                                    text: "Only premium, top-rated resources approved by our team.",
                                },
                                {
                                    icon: Sparkles,
                                    title: "Designed for results",
                                    text: "Each product is chosen because it delivers — not because it's loud.",
                                },
                                {
                                    icon: Star,
                                    title: "Loved by thousands",
                                    text: "Backed by global reviews, real testimonials and proven outcomes.",
                                },
                            ].map((b) => (
                                <div key={b.title} className="space-y-3">
                                    <b.icon className="h-5 w-5 text-gold" />
                                    <h3 className="font-serif text-2xl text-cream tracking-tight">
                                        {b.title}
                                    </h3>
                                    <p className="text-cream/65 font-light">{b.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* All products */}
            <section
                data-testid="category-products"
                className="relative py-24"
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.5em] text-gold/85 mb-3">
                                The Collection
                            </p>
                            <h2 className="font-serif text-4xl md:text-5xl text-cream tracking-tight">
                                Featured & curated
                            </h2>
                        </div>
                        <p className="text-cream/55 text-sm uppercase tracking-[0.25em]">
                            {products.length} products
                        </p>
                    </div>
                    {loading ? (
                        <div className="text-cream/60">Loading curated products…</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {[...featured, ...rest].map((p, i) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <TestimonialGrid
                testimonials={[
                    {
                        name: "Hannah K.",
                        location: "Berlin, DE",
                        quote:
                            "I always wished someone would just tell me what's actually worth it. CrLuys does exactly that.",
                        rating: 5,
                    },
                    {
                        name: "Marco V.",
                        location: "São Paulo, BR",
                        quote: "Quality. Trust. Real outcomes. That's why I keep coming back.",
                        rating: 5,
                    },
                    {
                        name: "Lía P.",
                        location: "Buenos Aires, AR",
                        quote: "Premium feel, real impact. This is a category-defining brand.",
                        rating: 5,
                    },
                ]}
            />

            <div className="py-20 text-center">
                <Link
                    to="/"
                    data-testid="category-back-home"
                    className="inline-flex items-center gap-3 px-7 py-4 rounded-full border border-gold/40 text-cream hover:bg-gold hover:text-ink transition-all duration-500 group"
                >
                    <span className="text-sm uppercase tracking-[0.3em]">
                        Explore All Categories
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <NewsletterCTA />
        </main>
    );
}
