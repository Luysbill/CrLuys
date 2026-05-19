import React, { useState } from "react";
import { Send } from "lucide-react";
import { apiClient, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";

export default function NewsletterCTA() {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e) => {
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
        <section
            data-testid="newsletter-section"
            className="relative py-20 md:py-32 overflow-hidden"
        >
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-ink-50 via-ink to-ink-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gold/10 blur-[120px]" />
            </div>
            <div className="max-w-3xl mx-auto px-6 text-center">
                <p className="text-[11px] uppercase tracking-[0.5em] text-gold/80 mb-5">
                    The Private List
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl text-cream leading-[1.05] tracking-tight mb-5 sm:mb-6">
                    Lifestyle drops, sent like
                    <br />
                    <span className="italic gold-gradient-text">love letters.</span>
                </h2>
                <p className="text-cream/65 font-light text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
                    Receive curated recommendations, exclusive offers and intentional
                    living rituals — directly in your inbox.
                </p>
                <form
                    onSubmit={onSubmit}
                    className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
                    data-testid="newsletter-form"
                >
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        data-testid="newsletter-input"
                        className="w-full bg-ink-100 border border-gold/25 rounded-full px-6 py-4 text-cream placeholder-cream/40 outline-none focus:border-gold transition-colors font-light"
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        data-testid="newsletter-submit"
                        className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-gold text-ink hover:bg-gold-light transition-colors disabled:opacity-60 whitespace-nowrap"
                    >
                        <span className="text-sm uppercase tracking-[0.3em] font-medium">
                            {submitting ? "Joining..." : "Join"}
                        </span>
                        <Send className="h-4 w-4" />
                    </button>
                </form>
                <p className="mt-5 text-xs text-cream/40">
                    Unsubscribe anytime · No spam · Pure value
                </p>
            </div>
        </section>
    );
}
