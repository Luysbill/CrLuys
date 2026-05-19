import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQAccordion({ items = [] }) {
    const [open, setOpen] = useState(0);
    if (!items.length) return null;
    return (
        <section
            data-testid="faq-section"
            className="relative py-16 sm:py-24"
        >
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-14">
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gold/80 mb-4">
                        Common Questions
                    </p>
                    <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight">
                        Everything you need to <span className="italic gold-gradient-text">know</span>.
                    </h2>
                </div>
                <div>
                    {items.map((it, i) => {
                        const active = open === i;
                        return (
                            <div
                                key={i}
                                data-testid={`faq-item-${i}`}
                                className="border-b border-gold/20"
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpen(active ? -1 : i)}
                                    className="w-full flex items-center justify-between gap-6 py-6 text-left"
                                    data-testid={`faq-toggle-${i}`}
                                >
                                    <span className="font-serif text-xl md:text-2xl text-cream leading-tight">
                                        {it.question}
                                    </span>
                                    <span className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-full border border-gold/30 text-gold transition-colors">
                                        {active ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </span>
                                </button>
                                <div
                                    className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-out ${
                                        active ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"
                                    }`}
                                >
                                    <p className="text-cream/70 font-light leading-relaxed pr-12">
                                        {it.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
