import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowUpRight,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    ShieldCheck,
    TrendingUp,
    Diamond,
    Target,
    Compass,
    Users,
    LineChart,
    Lock,
    Quote,
    Star,
    Check,
    Mail,
    Loader2,
} from "lucide-react";
import {
    SMART_INVESTING_EXTERNAL_URL,
    CATEGORY_IMAGES,
    apiClient,
    formatApiErrorDetail,
} from "../lib/api";
import { useKeystoneOnboarding } from "../lib/keystone-onboarding";
import FAQAccordion from "../components/FAQAccordion";
import { toast } from "sonner";

const STATS = [
    { value: "12,400+", label: "Private members" },
    { value: "$2.4B", label: "Portfolio intelligence" },
    { value: "+18.7%", label: "Avg. annualised return" },
    { value: "7.3y", label: "Member tenure" },
];

const PILLARS = [
    {
        icon: Compass,
        title: "Disciplined Frameworks",
        text: "Time-tested investment principles, refined for the modern investor. Stop guessing. Start allocating with intention.",
    },
    {
        icon: Diamond,
        title: "Curated Private Deal Flow",
        text: "Vetted private equity, alternative assets and global opportunities usually reserved for institutional capital.",
    },
    {
        icon: LineChart,
        title: "Weekly Market Intelligence",
        text: "Concise, actionable briefings written by senior analysts — the signal, without the noise.",
    },
    {
        icon: Users,
        title: "Senior Advisor Access",
        text: "Direct conversations with portfolio managers, tax strategists and a private peer network.",
    },
];

const METHOD = [
    {
        n: "01",
        title: "Apply privately",
        text: "Submit your private application. Reviewed within 48 hours by our membership team.",
    },
    {
        n: "02",
        title: "Onboarding call",
        text: "A 45-minute conversation to map your financial life and align on your wealth goals.",
    },
    {
        n: "03",
        title: "Deploy with confidence",
        text: "Access frameworks, deals and advisors — and start compounding with intent.",
    },
];

const TESTIMONIALS = [
    {
        name: "Marcus J.",
        role: "Tech Founder · Berlin",
        quote:
            "I left a 9-figure exit with no plan. Keystone gave me a framework, a peer group and a calm decision-making process. Best decision I made post-exit.",
        result: "Portfolio +24% YoY",
    },
    {
        name: "Sofia L.",
        role: "Private Investor · Madrid",
        quote:
            "I had wealth, but no clarity. Now I sleep through volatile markets. That alone was worth every euro.",
        result: "Clarity, finally",
    },
    {
        name: "David R.",
        role: "Surgeon · Toronto",
        quote:
            "I've subscribed to every newsletter. Keystone is different — it's an actual community of serious investors. The deal flow alone is unmatched.",
        result: "3 private deals in year 1",
    },
];

const FAQ_ITEMS = [
    {
        question: "Who is Keystone Investors Club designed for?",
        answer:
            "Serious investors — founders, executives, professionals and private investors — who value disciplined frameworks, premium peer networks and curated deal flow. Beginners welcome with the right mindset.",
    },
    {
        question: "Is this a stock-picking service?",
        answer:
            "No. Keystone is a private investors' circle — not a tip service. We focus on strategies, allocation frameworks, market intelligence and curated alternative opportunities you can act on with clarity.",
    },
    {
        question: "How much time does membership require?",
        answer:
            "Most members spend 30–60 minutes per week on briefings and community discussion. Onboarding takes a single 45-minute call.",
    },
    {
        question: "What if I'm new to investing?",
        answer:
            "Excellent. Many of our members started fresh. The membership is structured to meet you where you are — from foundations to advanced allocations.",
    },
    {
        question: "Is there a satisfaction guarantee?",
        answer:
            "Yes. Every new member is covered by a 30-day satisfaction window. If Keystone isn't the right fit, full refund — no questions asked.",
    },
];

function InlineApplyForm() {
    const [goal, setGoal] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const goals = [
        { value: "long-term-wealth", label: "Build long-term wealth" },
        { value: "private-deals", label: "Private investments" },
        { value: "financial-freedom", label: "Financial freedom" },
        { value: "diversify", label: "Smart diversification" },
        { value: "legacy", label: "Legacy & retirement" },
    ];

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);
        try {
            await apiClient.post("/leads", {
                email,
                name,
                goal,
                source: "smart-investing",
                cta: "inline-apply-form",
            });
            setSubmitted(true);
            toast.success("Welcome to the circle. Opening Keystone…");
            setTimeout(() => {
                window.open(
                    SMART_INVESTING_EXTERNAL_URL,
                    "_blank",
                    "noopener,noreferrer"
                );
            }, 1100);
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail));
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div
                data-testid="inline-apply-confirmation"
                className="bg-ink-100/80 backdrop-blur-md border border-gold/35 rounded-3xl p-10 text-center"
            >
                <div className="mx-auto h-14 w-14 rounded-full border border-gold/40 bg-gold/10 inline-flex items-center justify-center mb-5">
                    <Check className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-serif text-3xl text-cream mb-3 tracking-tight">
                    Welcome to the <span className="italic gold-gradient-text">circle</span>.
                </h3>
                <p className="text-cream/65 font-light">
                    Opening Keystone Investors Club in a new tab — your application is
                    reviewed within 48 hours.
                </p>
            </div>
        );
    }

    return (
        <form
            onSubmit={onSubmit}
            data-testid="inline-apply-form"
            className="bg-ink-100/80 backdrop-blur-md border border-gold/25 rounded-3xl p-7 md:p-10 space-y-6"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] uppercase tracking-[0.35em] text-cream/55 mb-2 block">
                        Your name <span className="text-cream/30">(optional)</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        data-testid="inline-apply-name"
                        className="w-full bg-transparent border-b border-gold/30 focus:border-gold outline-none py-2.5 text-cream font-light"
                    />
                </div>
                <div>
                    <label className="text-[10px] uppercase tracking-[0.35em] text-cream/55 mb-2 block">
                        Private email
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        data-testid="inline-apply-email"
                        placeholder="you@private.email"
                        className="w-full bg-transparent border-b border-gold/30 focus:border-gold outline-none py-2.5 text-cream font-light placeholder-cream/30"
                    />
                </div>
            </div>

            <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-cream/55 mb-3">
                    Your #1 financial goal (optional)
                </p>
                <div className="flex flex-wrap gap-2">
                    {goals.map((g) => {
                        const selected = goal === g.value;
                        return (
                            <button
                                type="button"
                                key={g.value}
                                onClick={() => setGoal(selected ? "" : g.value)}
                                data-testid={`inline-apply-goal-${g.value}`}
                                className={`text-[12px] tracking-wide px-4 py-2 rounded-full border transition-all duration-300 ${
                                    selected
                                        ? "border-gold bg-gold text-ink"
                                        : "border-gold/25 text-cream/75 hover:border-gold/55"
                                }`}
                            >
                                {g.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
                <button
                    type="submit"
                    disabled={submitting}
                    data-testid="inline-apply-submit"
                    className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-gold text-ink hover:bg-gold-light transition-all duration-500 hover:shadow-[0_0_28px_rgba(212,175,55,0.5)] disabled:opacity-70 group"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm uppercase tracking-[0.3em] font-medium">
                                Submitting
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-sm uppercase tracking-[0.3em] font-medium">
                                Apply for Membership
                            </span>
                            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                        </>
                    )}
                </button>
                <p className="text-[11px] text-cream/40 max-w-[55%]">
                    Strictly confidential · 48-hour review · 30-day satisfaction window
                </p>
            </div>
        </form>
    );
}

export default function SmartInvestingPage() {
    const { openOnboarding } = useKeystoneOnboarding();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        // Mark mounted for entry animation
        const t = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(t);
    }, []);

    const openKeystone = (cta) =>
        openOnboarding(SMART_INVESTING_EXTERNAL_URL, cta);

    return (
        <main
            data-testid="smart-investing-page"
            className={`pt-24 transition-opacity duration-700 ${
                mounted ? "opacity-100" : "opacity-0"
            }`}
        >
            {/* ============ HERO ============ */}
            <section
                data-testid="smart-investing-hero"
                className="relative min-h-[88svh] flex items-center pt-12 pb-20 overflow-hidden"
            >
                <div className="absolute inset-0 -z-10">
                    <img
                        src={CATEGORY_IMAGES["smart-investing"]}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-55"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                    <div className="absolute -top-40 -right-20 h-[500px] w-[500px] rounded-full bg-gold/15 blur-[140px]" />
                    <div className="absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-gold/8 blur-[140px]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 md:px-12 w-full">
                    {/* Breadcrumb */}
                    <Link
                        to="/"
                        data-testid="si-back-home"
                        className="inline-flex items-center gap-2 text-cream/55 hover:text-gold transition-colors text-[10px] uppercase tracking-[0.4em] mb-10"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> CrLuys Lifestyle Ecosystem
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
                        <div className="lg:col-span-8 animate-fade-up">
                            <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full glass">
                                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                                <span className="text-[10px] uppercase tracking-[0.45em] text-gold/95">
                                    01 · The Flagship Pillar · CrLuys × Keystone Investors Club
                                </span>
                            </div>

                            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-cream leading-[0.92] tracking-tighter font-light">
                                Financial Freedom
                                <br />
                                <span className="italic gold-gradient-text">
                                    Changes Everything.
                                </span>
                            </h1>

                            <p className="mt-7 text-cream/75 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
                                The Smart Investing pillar of CrLuys is powered by{" "}
                                <span className="text-gold">
                                    Keystone Investors Club
                                </span>{" "}
                                — a private circle for serious wealth builders. Curated
                                strategies, vetted opportunities and senior advisors, all in
                                one cinematic destination.
                            </p>

                            <div className="mt-9 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => openKeystone("smart-investing-hero-apply")}
                                    data-testid="si-hero-cta-primary"
                                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gold text-ink hover:bg-gold-light transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] group"
                                >
                                    <span className="text-sm uppercase tracking-[0.3em] font-medium">
                                        Apply for Membership
                                    </span>
                                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                                <a
                                    href="#how-it-works"
                                    data-testid="si-hero-cta-secondary"
                                    className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-gold/40 text-cream hover:text-gold hover:border-gold transition-colors"
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="text-sm uppercase tracking-[0.3em]">
                                        How It Works
                                    </span>
                                </a>
                            </div>

                            <div className="mt-8 flex items-center gap-4">
                                <div className="flex items-center gap-1 star-gold">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4" />
                                    ))}
                                </div>
                                <p className="text-sm text-cream/65 font-light">
                                    Trusted by 12,400+ private investors worldwide
                                </p>
                            </div>
                        </div>

                        <div
                            className="lg:col-span-4 animate-fade-up"
                            style={{ animationDelay: "0.35s" }}
                        >
                            <div
                                className="grid grid-cols-2 gap-3"
                                data-testid="si-hero-stats"
                            >
                                {STATS.map((s) => (
                                    <div
                                        key={s.label}
                                        className="bg-ink-100/70 backdrop-blur-md border border-gold/20 rounded-2xl p-5 hover:border-gold/55 transition-colors"
                                    >
                                        <p className="font-serif text-3xl gold-gradient-text leading-tight">
                                            {s.value}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-cream/55 mt-1">
                                            {s.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-cream/40 mt-4 flex items-center gap-2">
                                <Lock className="h-3 w-3 text-gold" />
                                Strictly confidential application
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ INNER CIRCLE ============ */}
            <section
                id="inner-circle"
                data-testid="si-inner-circle"
                className="relative py-28 md:py-36 border-y border-gold/15 bg-ink-50/30"
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-14">
                        <div className="lg:col-span-5">
                            <p className="text-[11px] uppercase tracking-[0.5em] text-gold/90 mb-4">
                                Inside The Circle
                            </p>
                            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream leading-[0.98] tracking-tight">
                                A private circle,
                                <br />
                                <span className="italic gold-gradient-text">
                                    not a platform.
                                </span>
                            </h2>
                        </div>
                        <div className="lg:col-span-7 lg:pt-3">
                            <p className="text-cream/65 font-light text-lg leading-relaxed max-w-2xl">
                                Keystone is built for the few — not the many. Inside, you'll
                                find frameworks, deals and conversations engineered to make
                                disciplined, intentional capital allocation feel natural.
                            </p>
                        </div>
                    </div>

                    <div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6"
                        data-testid="si-pillars"
                    >
                        {PILLARS.map((p) => (
                            <div
                                key={p.title}
                                className="group relative bg-ink-100/60 backdrop-blur-md border border-gold/15 rounded-3xl p-7 hover:border-gold/55 transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute -top-16 -right-16 h-32 w-32 bg-gold/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/35 bg-ink-50 mb-5">
                                    <p.icon className="h-4 w-4 text-gold" />
                                </span>
                                <h3 className="font-serif text-2xl text-cream leading-tight tracking-tight mb-3">
                                    {p.title}
                                </h3>
                                <p className="text-cream/65 font-light leading-relaxed text-[15px]">
                                    {p.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ HOW IT WORKS ============ */}
            <section
                id="how-it-works"
                data-testid="si-how-it-works"
                className="relative py-28 md:py-36 overflow-hidden"
            >
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink to-ink-50/60" />
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <p className="text-[11px] uppercase tracking-[0.5em] text-gold/90 mb-4">
                            How it works
                        </p>
                        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream leading-[1.0] tracking-tight">
                            Three quiet steps to{" "}
                            <span className="italic gold-gradient-text">
                                financial clarity
                            </span>
                            .
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
                        {METHOD.map((m, i) => (
                            <div
                                key={m.n}
                                data-testid={`si-step-${m.n}`}
                                className="relative bg-ink-100/60 border border-gold/15 rounded-3xl p-8 hover:border-gold/45 transition-colors"
                            >
                                <p className="font-serif italic text-gold/85 text-lg mb-5">
                                    {m.n}
                                </p>
                                <h3 className="font-serif text-3xl text-cream leading-tight tracking-tight mb-4">
                                    {m.title}
                                </h3>
                                <p className="text-cream/65 font-light leading-relaxed">
                                    {m.text}
                                </p>
                                {i < METHOD.length - 1 && (
                                    <ArrowRight className="hidden md:block absolute -right-7 top-1/2 -translate-y-1/2 h-6 w-6 text-gold/50" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ TESTIMONIALS ============ */}
            <section
                data-testid="si-testimonials"
                className="relative py-24 border-y border-gold/15 bg-ink-50/40"
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-14">
                        <p className="text-[11px] uppercase tracking-[0.5em] text-gold/90 mb-4">
                            Member outcomes
                        </p>
                        <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight">
                            What members{" "}
                            <span className="italic gold-gradient-text">say</span>.
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {TESTIMONIALS.map((t, i) => (
                            <div
                                key={i}
                                className="relative bg-ink-100/70 border border-gold/15 rounded-3xl p-8 hover:border-gold/40 transition-colors"
                                data-testid={`si-testimonial-${i}`}
                            >
                                <Quote className="absolute -top-4 left-6 h-10 w-10 text-gold/80" />
                                <div className="flex items-center gap-1 mb-4 star-gold">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="h-4 w-4" />
                                    ))}
                                </div>
                                <p className="font-serif italic text-cream text-xl leading-snug mb-6">
                                    "{t.quote}"
                                </p>
                                <p className="text-sm uppercase tracking-[0.25em] text-gold/95">
                                    {t.name}
                                </p>
                                <p className="text-xs text-cream/50 mt-1">{t.role}</p>
                                <div className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-gold/85 border border-gold/30 rounded-full px-3 py-1">
                                    <TrendingUp className="h-3 w-3" /> {t.result}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ APPLY (inline) ============ */}
            <section
                id="apply"
                data-testid="si-apply"
                className="relative py-28 md:py-36 overflow-hidden"
            >
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-50/60 to-ink" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gold/10 blur-[120px]" />
                </div>
                <div className="max-w-5xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        <div className="lg:col-span-5">
                            <p className="text-[11px] uppercase tracking-[0.5em] text-gold/90 mb-4">
                                Apply privately
                            </p>
                            <h2 className="font-serif text-4xl md:text-5xl text-cream leading-[1.05] tracking-tight mb-5">
                                Your invitation to the{" "}
                                <span className="italic gold-gradient-text">
                                    inner circle
                                </span>
                                .
                            </h2>
                            <p className="text-cream/65 font-light leading-relaxed mb-6">
                                A brief application. We'll review and open the Keystone
                                destination for you in a new tab.
                            </p>
                            <div className="space-y-3 text-cream/75 text-sm">
                                <p className="inline-flex items-center gap-2">
                                    <Check className="h-4 w-4 text-gold" /> 48-hour review
                                </p>
                                <p className="inline-flex items-center gap-2">
                                    <Check className="h-4 w-4 text-gold" /> 30-day satisfaction
                                    window
                                </p>
                                <p className="inline-flex items-center gap-2">
                                    <Check className="h-4 w-4 text-gold" /> Strictly
                                    confidential
                                </p>
                            </div>
                        </div>
                        <div className="lg:col-span-7">
                            <InlineApplyForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ FAQ ============ */}
            <FAQAccordion items={FAQ_ITEMS} />

            {/* ============ FINAL CTA STRIP ============ */}
            <section
                data-testid="si-final-cta"
                className="relative py-24 md:py-32 overflow-hidden"
            >
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-ink-50/60 via-ink to-ink-50/60" />
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <Sparkles className="h-6 w-6 text-gold mx-auto mb-5" />
                    <h2 className="font-serif text-4xl md:text-6xl text-cream leading-[1.05] tracking-tight mb-6">
                        Your best wealth decade is{" "}
                        <span className="italic gold-gradient-text">one decision away</span>
                        .
                    </h2>
                    <p className="text-cream/65 font-light text-lg mb-10 max-w-xl mx-auto">
                        Curated for the few. Backed by results. Open Keystone Investors
                        Club and step into the room.
                    </p>
                    <button
                        type="button"
                        onClick={() => openKeystone("smart-investing-final-strip")}
                        data-testid="si-final-cta-button"
                        className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-gold text-ink hover:bg-gold-light transition-all duration-500 hover:shadow-[0_0_36px_rgba(212,175,55,0.55)] group"
                    >
                        <span className="text-sm uppercase tracking-[0.3em] font-medium">
                            Open Keystone Investors Club
                        </span>
                        <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                    <p className="text-xs text-cream/40 mt-5">
                        Opens the Keystone destination in a new tab · Strictly confidential
                    </p>
                </div>
            </section>
        </main>
    );
}
