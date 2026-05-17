import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
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
                    ? "py-3 glass-strong border-b border-gold/20 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]"
                    : "py-5 bg-gradient-to-b from-ink/70 via-ink/30 to-transparent backdrop-blur-sm"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between gap-6">
                <Link
                    to="/"
                    data-testid="header-logo"
                    className="flex items-center gap-3 group shrink-0"
                    aria-label="CrLuys Lifestyle — Home"
                >
                    <span className="relative inline-flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full transition-all duration-500 group-hover:scale-[1.06]">
                        <span className="absolute inset-0 rounded-full ring-1 ring-gold/30 group-hover:ring-gold/70 transition-all" />
                        <span className="absolute -inset-1 rounded-full bg-gold/0 group-hover:bg-gold/15 blur-md transition-all duration-500" />
                        <img
                            src="/crluys-icon.png"
                            alt="CrLuys Lifestyle"
                            className="brand-icon relative h-9 w-9 md:h-10 md:w-10 object-contain select-none"
                            draggable={false}
                        />
                    </span>
                    <span className="hidden sm:flex flex-col leading-tight">
                        <span className="font-serif text-[15px] md:text-base text-cream tracking-wide">
                            CrLuys
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.4em] text-gold/85 -mt-0.5">
                            Lifestyle
                        </span>
                    </span>
                </Link>

                <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                    {NAV.map((n) => {
                        const testid = `nav-${n.name.replace(/\s+/g, "-").toLowerCase()}`;
                        const itemBase = `relative px-3 xl:px-4 py-2 text-[11px] xl:text-[12px] tracking-[0.28em] uppercase transition-all duration-300 whitespace-nowrap group/nav`;
                        const featuredCls = n.featured
                            ? "text-gold"
                            : "text-cream/70 hover:text-cream";
                        const underline = (
                            <span
                                className={`absolute left-3 right-3 xl:left-4 xl:right-4 bottom-1 h-px bg-gold transition-transform duration-500 origin-left ${
                                    n.featured
                                        ? "scale-x-100 opacity-100"
                                        : "scale-x-0 group-hover/nav:scale-x-100 opacity-70"
                                }`}
                                aria-hidden
                            />
                        );
                        if (n.external) {
                            return (
                                <button
                                    key={n.to}
                                    type="button"
                                    onClick={() => openOnboarding(n.to, `nav-${n.name}`)}
                                    data-testid={testid}
                                    className={`${itemBase} ${featuredCls}`}
                                >
                                    <span className="relative">{n.name}</span>
                                    {underline}
                                </button>
                            );
                        }
                        return (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                data-testid={testid}
                                className={({ isActive }) =>
                                    `${itemBase} ${
                                        isActive ? "text-gold" : featuredCls
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className="relative">{n.name}</span>
                                        <span
                                            className={`absolute left-3 right-3 xl:left-4 xl:right-4 bottom-1 h-px bg-gold transition-transform duration-500 origin-left ${
                                                isActive
                                                    ? "scale-x-100 opacity-100"
                                                    : "scale-x-0 group-hover/nav:scale-x-100 opacity-70"
                                            }`}
                                            aria-hidden
                                        />
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="hidden lg:flex items-center gap-4 shrink-0">
                    <Link
                        to="/?focus=search"
                        data-testid="header-search-cta"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-cream/65 hover:text-gold hover:bg-gold/5 transition-all duration-300 text-[11px] tracking-[0.25em] uppercase"
                    >
                        <Search className="h-3.5 w-3.5" /> Search
                    </Link>
                    <span className="h-4 w-px bg-gold/20" aria-hidden />
                    <Link
                        to="/admin/login"
                        data-testid="header-admin-link"
                        className="text-[10px] uppercase tracking-[0.35em] text-cream/45 hover:text-gold transition-colors"
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
