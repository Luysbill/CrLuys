import React from "react";
import { ShieldCheck, Sparkles, Star, BadgeCheck, Lock } from "lucide-react";

const ITEMS = [
    { icon: BadgeCheck, label: "Curated Premium Only" },
    { icon: ShieldCheck, label: "Verified Affiliate Partners" },
    { icon: Star, label: "Top-Rated Globally" },
    { icon: Lock, label: "Secure & Private Checkout" },
    { icon: Sparkles, label: "Lifetime Customer Care" },
];

export default function TrustBar() {
    return (
        <section
            id="trust"
            data-testid="trust-bar"
            className="relative py-10 sm:py-16 border-y border-gold/15 bg-ink-50/40"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex flex-wrap items-center justify-around gap-x-10 gap-y-6">
                    {ITEMS.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center gap-3 text-cream/75"
                        >
                            <item.icon className="h-4 w-4 text-gold" />
                            <span className="text-xs uppercase tracking-[0.3em]">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
