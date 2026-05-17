import React, { useState } from "react";
import { Mail, Send, MapPin, MessageCircle } from "lucide-react";
import { apiClient, formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [submitting, setSubmitting] = useState(false);

    const onChange = (e) =>
        setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) return;
        setSubmitting(true);
        try {
            const { data } = await apiClient.post("/contact", form);
            toast.success(data.message || "Message sent.");
            setForm({ name: "", email: "", message: "" });
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main
            data-testid="contact-page"
            className="pt-40 pb-32 relative min-h-[80vh]"
        >
            <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-5 lg:sticky lg:top-32">
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gold/85 mb-4">
                        Contact
                    </p>
                    <h1 className="font-serif text-5xl md:text-6xl text-cream leading-[1.0] tracking-tight mb-6">
                        Let's <span className="italic gold-gradient-text">talk</span>.
                    </h1>
                    <p className="text-cream/65 font-light leading-relaxed mb-10 max-w-md">
                        Questions, collaborations or curation requests — drop us a line and
                        someone from our team will respond within 24 hours.
                    </p>
                    <div className="space-y-5">
                        <div className="flex items-center gap-4 text-cream/80">
                            <span className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-gold/30">
                                <Mail className="h-4 w-4 text-gold" />
                            </span>
                            <a
                                href="mailto:hello@crluys.com"
                                className="fancy-link"
                                data-testid="contact-email"
                            >
                                hello@crluys.com
                            </a>
                        </div>
                        <div className="flex items-center gap-4 text-cream/80">
                            <span className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-gold/30">
                                <MessageCircle className="h-4 w-4 text-gold" />
                            </span>
                            <span>24h response · Premium support</span>
                        </div>
                        <div className="flex items-center gap-4 text-cream/80">
                            <span className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-gold/30">
                                <MapPin className="h-4 w-4 text-gold" />
                            </span>
                            <span>Operating worldwide</span>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={onSubmit}
                    data-testid="contact-form"
                    className="lg:col-span-7 bg-ink-100 border border-gold/15 rounded-3xl p-8 md:p-10 space-y-6"
                >
                    <div>
                        <label className="text-xs uppercase tracking-[0.3em] text-cream/55 mb-2 block">
                            Your name
                        </label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={onChange}
                            required
                            data-testid="contact-name"
                            className="w-full bg-transparent border-b border-gold/30 focus:border-gold outline-none py-3 text-cream font-light"
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-[0.3em] text-cream/55 mb-2 block">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={onChange}
                            required
                            data-testid="contact-email-input"
                            className="w-full bg-transparent border-b border-gold/30 focus:border-gold outline-none py-3 text-cream font-light"
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-[0.3em] text-cream/55 mb-2 block">
                            Message
                        </label>
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={onChange}
                            required
                            rows={5}
                            data-testid="contact-message"
                            className="w-full bg-transparent border-b border-gold/30 focus:border-gold outline-none py-3 text-cream font-light resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        data-testid="contact-submit"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gold text-ink hover:bg-gold-light transition-colors disabled:opacity-50"
                    >
                        <span className="text-sm uppercase tracking-[0.3em] font-medium">
                            {submitting ? "Sending…" : "Send message"}
                        </span>
                        <Send className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </main>
    );
}
