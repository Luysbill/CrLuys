import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Send } from "lucide-react";
import { apiClient, formatApiErrorDetail, CATEGORIES } from "../lib/api";
import { useKeystoneOnboarding } from "../lib/keystone-onboarding";
import { toast } from "sonner";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { openOnboarding } = useKeystoneOnboarding();

    const onSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);
        try {
            const { data } = await apiClient.post("/newsletter", { email });
            toast.success(data.message || "You're in.");
            setEmail("");
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <footer
            data-testid="site-footer"
            className="relative bg-ink-50 border-t border-gold/15 mt-20 sm:mt-32 pt-16 sm:pt-24 pb-10 sm:pb-12 overflow-hidden"
        >
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[120%] bg-gold/5 blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 md:px-12">
                <div className="text-center mb-14 sm:mb-20">
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gold/80 mb-5 sm:mb-6">
                        The CrLuys Promise
                    </p>
                    <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl text-cream leading-tight">
                        Elevate Your Health.
                        <br />
                        <span className="gold-gradient-text italic">Elevate Your Life.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 mb-14 sm:mb-20">
                    <div className="md:col-span-5">
                        <Link to="/" className="inline-block mb-5">
                            <img
                                src="/crluys-logo.png"
                                alt="CrLuys Lifestyle"
                                className="brand-logo-soft h-20 md:h-24 w-auto select-none"
                                draggable={false}
                            />
                        </Link>
                        <p className="text-cream/60 font-light max-w-md leading-relaxed">
                            A curated lifestyle ecosystem for the modern soul — wellness,
                            financial freedom, fitness, mindset and intentional living, all in one
                            place.
                        </p>
                        <form
                            onSubmit={onSubscribe}
                            className="mt-8 flex items-center border-b border-gold/30 pb-2 max-w-md"
                            data-testid="footer-newsletter-form"
                        >
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your private email"
                                data-testid="footer-newsletter-input"
                                className="flex-1 bg-transparent border-0 outline-none text-cream placeholder-cream/40 py-3 font-light"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                data-testid="footer-newsletter-submit"
                                className="text-gold hover:text-gold-light transition-colors disabled:opacity-50"
                                aria-label="Subscribe"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </form>
                        <p className="text-xs text-cream/40 mt-3">
                            Receive curated lifestyle drops. No spam. Unsubscribe anytime.
                        </p>
                    </div>

                    <div className="md:col-span-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-gold/80 mb-5">
                            Categories
                        </p>
                        <ul className="space-y-3">
                            {CATEGORIES.map((c) => {
                                if (c.external_url) {
                                    return (
                                        <li key={c.slug}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openOnboarding(
                                                        c.external_url,
                                                        `footer-${c.slug}`
                                                    )
                                                }
                                                data-testid={`footer-category-${c.slug}`}
                                                className={`transition-colors font-light inline-flex items-center gap-2 ${
                                                    c.featured_primary
                                                        ? "text-gold hover:text-gold-light"
                                                        : "text-cream/70 hover:text-gold"
                                                }`}
                                            >
                                                {c.short}
                                                {c.featured_primary && (
                                                    <span className="text-[9px] uppercase tracking-[0.25em] text-gold/70">
                                                        Flagship
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    );
                                }
                                return (
                                    <li key={c.slug}>
                                        <Link
                                            to={`/category/${c.slug}`}
                                            data-testid={`footer-category-${c.slug}`}
                                            className="text-cream/70 hover:text-gold transition-colors font-light"
                                        >
                                            {c.short}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-gold/80 mb-5">
                            Company
                        </p>
                        <ul className="space-y-3 text-cream/70 font-light">
                            <li>
                                <Link to="/" className="hover:text-gold transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="hover:text-gold transition-colors"
                                    data-testid="footer-contact-link"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/admin/login"
                                    className="hover:text-gold transition-colors"
                                >
                                    Admin
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-gold/80 mb-5">
                            Follow
                        </p>
                        <div className="flex items-center gap-3">
                            <a
                                href="#"
                                aria-label="Instagram"
                                className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-gold/30 text-cream/80 hover:text-gold hover:border-gold transition-colors"
                            >
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                aria-label="YouTube"
                                className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-gold/30 text-cream/80 hover:text-gold hover:border-gold transition-colors"
                            >
                                <Youtube className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="gold-divider mb-8" />

                <div className="flex flex-col md:flex-row items-center justify-between text-xs text-cream/40 gap-3">
                    <p>
                        © {new Date().getFullYear()} CrLuys LifeStyle. All rights reserved.
                    </p>
                    <p className="font-light tracking-wide">
                        Verified affiliate platform · Curated by Luis Campos Ruiz
                    </p>
                </div>
            </div>
        </footer>
    );
}
