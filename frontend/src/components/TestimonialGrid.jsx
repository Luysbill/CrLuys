import React from "react";
import { Star, Quote } from "lucide-react";

export default function TestimonialGrid({ testimonials = [] }) {
    if (!testimonials.length) return null;
    return (
        <section
            data-testid="testimonial-grid"
            className="relative py-24"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gold/80 mb-4">
                        Real Stories
                    </p>
                    <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight">
                        Loved by people <span className="italic gold-gradient-text">like you</span>.
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            data-testid={`testimonial-${i}`}
                            className="relative bg-ink-100 border border-gold/15 rounded-3xl p-8 hover:border-gold/35 transition-colors"
                        >
                            <Quote className="absolute -top-4 left-6 h-10 w-10 text-gold/70" />
                            <div className="flex items-center gap-1 mb-4 star-gold">
                                {[...Array(t.rating || 5)].map((_, j) => (
                                    <Star key={j} className="h-4 w-4" />
                                ))}
                            </div>
                            <p className="font-serif italic text-cream text-xl leading-snug mb-6">
                                "{t.quote}"
                            </p>
                            <p className="text-sm uppercase tracking-[0.25em] text-gold/90">
                                {t.name}
                            </p>
                            {t.location && (
                                <p className="text-xs text-cream/45 mt-1">{t.location}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
