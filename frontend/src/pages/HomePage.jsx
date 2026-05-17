import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Hero from "../components/Hero";
import TrustBar from "../components/TrustBar";
import CategorySection from "../components/CategorySection";
import FeaturedFinancialSection from "../components/FeaturedFinancialSection";
import NewsletterCTA from "../components/NewsletterCTA";
import TestimonialGrid from "../components/TestimonialGrid";
import { apiClient, CATEGORIES } from "../lib/api";
import { Search } from "lucide-react";

const HOME_TESTIMONIALS = [
    {
        name: "Sofia Marín",
        location: "Madrid, ES",
        quote:
            "CrLuys feels like having a wise friend curate your life. Every product I tried changed something.",
        rating: 5,
    },
    {
        name: "Daniel R.",
        location: "Austin, TX",
        quote:
            "I came for the investing playbook, stayed for everything else. This is a lifestyle, not a store.",
        rating: 5,
    },
    {
        name: "Aisha N.",
        location: "London, UK",
        quote:
            "Premium curation. Real results. It's the antidote to chaotic, overwhelming marketplaces.",
        rating: 5,
    },
];

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const { data } = await apiClient.get("/products");
                setProducts(data);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (searchParams.get("focus") === "search") {
            const el = document.getElementById("search-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }
    }, [searchParams]);

    const grouped = useMemo(() => {
        const map = {};
        for (const c of CATEGORIES) map[c.slug] = [];
        for (const p of products) {
            if (map[p.category]) map[p.category].push(p);
        }
        return map;
    }, [products]);

    const searchResults = useMemo(() => {
        if (!query && !filterCategory) return [];
        const q = query.trim().toLowerCase();
        return products.filter((p) => {
            const matchesQ =
                !q ||
                p.title.toLowerCase().includes(q) ||
                p.short_description?.toLowerCase().includes(q) ||
                p.headline?.toLowerCase().includes(q);
            const matchesCat = !filterCategory || p.category === filterCategory;
            return matchesQ && matchesCat;
        });
    }, [products, query, filterCategory]);

    return (
        <main data-testid="home-page" className="pt-0">
            <Hero />
            <TrustBar />

            {/* Search bar */}
            <section
                id="search-section"
                data-testid="search-section"
                className="relative py-12"
            >
                <div className="max-w-4xl mx-auto px-6 md:px-12">
                    <div className="glass rounded-2xl p-3 md:p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2">
                        <div className="flex-1 flex items-center gap-3 px-4 py-3">
                            <Search className="h-4 w-4 text-gold" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search the CrLuys collection…"
                                data-testid="home-search-input"
                                className="flex-1 bg-transparent outline-none text-cream placeholder-cream/40 font-light"
                            />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            data-testid="home-category-filter"
                            className="bg-ink-100 border border-gold/25 text-cream rounded-xl px-4 py-3 text-sm outline-none focus:border-gold"
                        >
                            <option value="">All categories</option>
                            {CATEGORIES.map((c) => (
                                <option key={c.slug} value={c.slug}>
                                    {c.short}
                                </option>
                            ))}
                        </select>
                    </div>
                    {(query || filterCategory) && (
                        <p
                            className="mt-3 text-xs uppercase tracking-[0.25em] text-cream/55"
                            data-testid="search-results-count"
                        >
                            {searchResults.length} curated result
                            {searchResults.length !== 1 ? "s" : ""}
                        </p>
                    )}
                    {(query || filterCategory) && (
                        <div
                            className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            data-testid="search-results-grid"
                        >
                            {searchResults.map((p) => {
                                const cat = CATEGORIES.find((c) => c.slug === p.category);
                                const href = cat?.internal_path || `/product/${p.slug}`;
                                return (
                                    <a
                                        key={p.id}
                                        href={href}
                                        className="group flex gap-4 p-4 bg-ink-100 border border-gold/15 rounded-2xl hover:border-gold/35 transition-colors"
                                    >
                                        <img
                                            src={p.image_url}
                                            alt={p.title}
                                            className="h-20 w-20 rounded-xl object-cover"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-[10px] uppercase tracking-[0.25em] text-gold/80">
                                                {cat?.short}
                                            </p>
                                            <p className="font-serif text-lg text-cream leading-tight truncate">
                                                {p.title}
                                            </p>
                                            <p className="text-sm text-gold mt-1">
                                                ${p.price?.toFixed(2)}
                                            </p>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {!loading && (
                <>
                    {CATEGORIES.map((c, i) => {
                        if (c.featured_primary && c.external_url) {
                            return <FeaturedFinancialSection key={c.slug} />;
                        }
                        return (
                            <CategorySection
                                key={c.slug}
                                category={c}
                                products={grouped[c.slug] || []}
                                reverse={i % 2 === 1}
                            />
                        );
                    })}
                </>
            )}

            <TestimonialGrid testimonials={HOME_TESTIMONIALS} />
            <NewsletterCTA />
        </main>
    );
}
