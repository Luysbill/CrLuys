import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Search, Sparkles } from "lucide-react";
import { CATEGORIES } from "../lib/api";
import { useKeystoneOnboarding } from "../lib/keystone-onboarding";

const NAV = [
    ...CATEGORIES.map((c) => ({
        name: c.short,
        to: c.external_url || `/category/${c.slug}`,
        external: Boolean(c.external_url),
        featured: Boolean(c.featured_primary),
    })),
    { name: "Contact", to: "/contact" },
];

export default function Header() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { openOnboarding } = useKeystoneOnboarding();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    return (
        <header
            data-testid="site-header"
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "py-3 glass-strong border-b border-gold/20"
                    : "py-5 bg-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
                <Link
                    to="/"
                    data-testid="header-logo"
                    className="flex items-center gap-3 group"
                >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-ink-50 transition-all group-hover:border-gold group-hover:shadow-[0_0_18px_rgba(212,175,55,0.35)]">
                        <Sparkles className="h-4 w-4 text-gold" />
                    </span>
                    <span className="leading-tight">
                        <span className="block font-serif text-2xl text-cream tracking-tight">
                            CrLuys
                        </span>
                        <span className="block text-[10px] uppercase tracking-[0.3em] text-gold/80">
                            Lifestyle
                        </span>
                    </span>
                </Link>

                <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
                    {NAV.map((n) => {
                        const testid = `nav-${n.name.replace(/\s+/g, "-").toLowerCase()}`;
                        if (n.external) {
                            return (
                                <button
                                    key={n.to}
                                    type="button"
                                    onClick={() => openOnboarding(n.to, `nav-${n.name}`)}
                                    data-testid={testid}
                                    className={`fancy-link text-[11px] xl:text-xs tracking-[0.25em] uppercase transition-colors whitespace-nowrap ${
                                        n.featured ? "text-gold" : "text-cream/70 hover:text-cream"
                                    }`}
                                >
                                    {n.name}
                                </button>
                            );
                        }
                        return (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                data-testid={testid}
                                className={({ isActive }) =>
                                    `fancy-link text-[11px] xl:text-xs tracking-[0.25em] uppercase transition-colors whitespace-nowrap ${
                                        isActive ? "text-gold" : "text-cream/70 hover:text-cream"
                                    }`
                                }
                            >
                                {n.name}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="hidden lg:flex items-center gap-3">
                    <Link
                        to="/?focus=search"
                        data-testid="header-search-cta"
                        className="inline-flex items-center gap-2 text-cream/70 hover:text-gold transition-colors text-sm tracking-wider uppercase"
                    >
                        <Search className="h-4 w-4" /> Search
                    </Link>
                    <Link
                        to="/admin/login"
                        data-testid="header-admin-link"
                        className="text-xs uppercase tracking-[0.25em] text-cream/40 hover:text-gold transition-colors"
                    >
                        Admin
                    </Link>
                </div>

                <button
                    type="button"
                    aria-label="Menu"
                    data-testid="mobile-menu-toggle"
                    onClick={() => setOpen((s) => !s)}
                    className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-cream"
                >
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {open && (
                <div
                    data-testid="mobile-menu"
                    className="lg:hidden mt-4 mx-4 rounded-2xl glass-strong border border-gold/20 p-6 flex flex-col gap-4 animate-fade-up"
                >
                    {NAV.map((n) => {
                        const testid = `mobile-nav-${n.name.replace(/\s+/g, "-").toLowerCase()}`;
                        if (n.external) {
                            return (
                                <button
                                    key={n.to}
                                    type="button"
                                    onClick={() =>
                                        openOnboarding(n.to, `mobile-nav-${n.name}`)
                                    }
                                    data-testid={testid}
                                    className={`text-base tracking-wide text-left ${
                                        n.featured ? "text-gold" : "text-cream/85"
                                    }`}
                                >
                                    {n.name}
                                </button>
                            );
                        }
                        return (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                data-testid={testid}
                                className={({ isActive }) =>
                                    `text-base tracking-wide ${
                                        isActive ? "text-gold" : "text-cream/85"
                                    }`
                                }
                            >
                                {n.name}
                            </NavLink>
                        );
                    })}
                    <Link
                        to="/admin/login"
                        data-testid="mobile-nav-admin"
                        className="text-sm text-cream/50 uppercase tracking-[0.25em]"
                    >
                        Admin
                    </Link>
                </div>
            )}
        </header>
    );
}
