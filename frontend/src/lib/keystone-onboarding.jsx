import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
    ArrowUpRight,
    X,
    Sparkles,
    TrendingUp,
    Target,
    Shield,
    Compass,
    Diamond,
    Loader2,
    Check,
} from "lucide-react";
import { apiClient, SMART_INVESTING_EXTERNAL_URL, formatApiErrorDetail } from "./api";

const GOALS = [
    { value: "long-term-wealth", icon: TrendingUp, title: "Build long-term wealth", subtitle: "Compound, patient capital growth" },
    { value: "private-deals", icon: Diamond, title: "Vetted private investments", subtitle: "Curated alternative assets" },
    { value: "financial-freedom", icon: Target, title: "Achieve financial freedom", subtitle: "Engineer a work-optional life" },
    { value: "diversify", icon: Compass, title: "Smarter diversification", subtitle: "Resilient across market cycles" },
    { value: "legacy", icon: Shield, title: "Protect & grow legacy", subtitle: "Family, retirement & estate" },
];

const Ctx = createContext(null);

export function KeystoneOnboardingProvider({ children }) {
    const [state, setState] = useState({
        open: false,
        redirectUrl: null,
        ctaLabel: "",
    });
    const openOnboarding = useCallback((redirectUrl, ctaLabel = "") => {
        setState({
            open: true,
            redirectUrl: redirectUrl || SMART_INVESTING_EXTERNAL_URL,
            ctaLabel,
        });
    }, []);
    const close = useCallback(() => {
        setState((s) => ({ ...s, open: false }));
    }, []);

    const value = useMemo(() => ({ openOnboarding }), [openOnboarding]);

    return (
        <Ctx.Provider value={value}>
            {children}
            <KeystoneOnboardingModal
                open={state.open}
                redirectUrl={state.redirectUrl}
                ctaLabel={state.ctaLabel}
                onClose={close}
            />
        </Ctx.Provider>
    );
}

export function useKeystoneOnboarding() {
    return useContext(Ctx);
}

function KeystoneOnboardingModal({ open, redirectUrl, ctaLabel, onClose }) {
    const [phase, setPhase] = useState("form"); // form | submitting | confirming
    const [goal, setGoal] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            // Reset state every time it opens
            setPhase("form");
            setGoal("");
            setEmail("");
            setName("");
            setError("");
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape" && phase === "form") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, phase, onClose]);

    if (!open) return null;

    const finalRedirect = redirectUrl || SMART_INVESTING_EXTERNAL_URL;

    const onSubmit = async (e) => {
        e?.preventDefault();
        if (!email) {
            setError("Please enter your email.");
            return;
        }
        setError("");
        setPhase("submitting");
        try {
            await apiClient.post("/leads", {
                email,
                name,
                goal,
                source: "smart-investing",
                cta: ctaLabel,
            });
        } catch (err) {
            setError(formatApiErrorDetail(err.response?.data?.detail));
            setPhase("form");
            return;
        }
        setPhase("confirming");
        // Smooth handoff after a moment so the confirmation can breathe
        setTimeout(() => {
            window.open(finalRedirect, "_blank", "noopener,noreferrer");
            // Then close the modal locally
            setTimeout(() => onClose(), 600);
        }, 1600);
    };

    return (
        <div
            data-testid="keystone-onboarding"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="keystone-onboarding-title"
        >
            {/* Cinematic backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
                onClick={phase === "form" ? onClose : undefined}
            />
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-gold/15 blur-[140px]" />
                <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-gold/10 blur-[120px]" />
            </div>

            {/* Card */}
            <div
                className="relative w-full max-w-xl rounded-3xl border border-gold/25 bg-ink-100/90 backdrop-blur-2xl shadow-[0_30px_90px_-20px_rgba(212,175,55,0.25)] animate-fade-up overflow-hidden"
                data-testid="keystone-onboarding-card"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
                <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gold/20 blur-3xl pointer-events-none" />

                {phase === "form" && (
                    <button
                        type="button"
                        onClick={onClose}
                        data-testid="keystone-onboarding-close"
                        aria-label="Close"
                        className="absolute top-5 right-5 h-9 w-9 inline-flex items-center justify-center rounded-full border border-gold/25 text-cream/70 hover:text-gold hover:border-gold transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                <div className="relative p-8 sm:p-10">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="h-4 w-4 text-gold" />
                        <span className="text-[10px] uppercase tracking-[0.45em] text-gold/90">
                            By Invitation · 01
                        </span>
                    </div>

                    {phase !== "confirming" && (
                        <>
                            <h2
                                id="keystone-onboarding-title"
                                className="font-serif text-3xl sm:text-4xl text-cream leading-[1.05] tracking-tight"
                            >
                                What's your <span className="italic gold-gradient-text">#1</span> financial goal?
                            </h2>
                            <p className="text-cream/65 font-light mt-3 leading-relaxed text-[15px]">
                                A brief moment so we can curate the right strategies for you before opening Keystone.
                            </p>

                            <form
                                onSubmit={onSubmit}
                                data-testid="keystone-onboarding-form"
                                className="mt-7 space-y-6"
                            >
                                {/* Goal selection */}
                                <fieldset className="space-y-2">
                                    <legend className="sr-only">Select your goal</legend>
                                    <div className="grid grid-cols-1 gap-2">
                                        {GOALS.map((g) => {
                                            const selected = goal === g.value;
                                            return (
                                                <button
                                                    key={g.value}
                                                    type="button"
                                                    data-testid={`keystone-goal-${g.value}`}
                                                    onClick={() =>
                                                        setGoal(selected ? "" : g.value)
                                                    }
                                                    className={`group flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 ${
                                                        selected
                                                            ? "border-gold bg-gold/8 shadow-[0_0_18px_rgba(212,175,55,0.18)]"
                                                            : "border-gold/15 hover:border-gold/45 bg-ink-50/40"
                                                    }`}
                                                    aria-pressed={selected}
                                                >
                                                    <span
                                                        className={`h-9 w-9 inline-flex items-center justify-center rounded-full border shrink-0 transition-colors ${
                                                            selected
                                                                ? "border-gold bg-gold text-ink"
                                                                : "border-gold/30 text-gold"
                                                        }`}
                                                    >
                                                        <g.icon className="h-4 w-4" />
                                                    </span>
                                                    <span className="flex-1 min-w-0">
                                                        <span
                                                            className={`block text-[15px] tracking-tight ${
                                                                selected
                                                                    ? "text-gold"
                                                                    : "text-cream"
                                                            }`}
                                                        >
                                                            {g.title}
                                                        </span>
                                                        <span className="block text-xs text-cream/55 font-light mt-0.5">
                                                            {g.subtitle}
                                                        </span>
                                                    </span>
                                                    <span
                                                        className={`shrink-0 h-5 w-5 rounded-full border inline-flex items-center justify-center transition-all ${
                                                            selected
                                                                ? "border-gold bg-gold text-ink"
                                                                : "border-gold/30 bg-transparent"
                                                        }`}
                                                        aria-hidden
                                                    >
                                                        {selected && (
                                                            <Check className="h-3 w-3" />
                                                        )}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[11px] text-cream/40 mt-2">
                                        Optional · You can skip this and continue with email only.
                                    </p>
                                </fieldset>

                                {/* Name + Email */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.35em] text-cream/55 mb-2 block">
                                            Your name <span className="text-cream/30">(optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            data-testid="keystone-onboarding-name"
                                            className="w-full bg-transparent border-b border-gold/30 focus:border-gold outline-none py-2.5 text-cream font-light tracking-tight transition-colors"
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
                                            data-testid="keystone-onboarding-email"
                                            placeholder="you@private.email"
                                            className="w-full bg-transparent border-b border-gold/30 focus:border-gold outline-none py-2.5 text-cream font-light placeholder-cream/30 tracking-tight transition-colors"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p
                                        className="text-sm text-red-300 font-light"
                                        data-testid="keystone-onboarding-error"
                                    >
                                        {error}
                                    </p>
                                )}

                                <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
                                    <button
                                        type="submit"
                                        disabled={phase === "submitting"}
                                        data-testid="keystone-onboarding-submit"
                                        className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-gold text-ink hover:bg-gold-light transition-all duration-500 hover:shadow-[0_0_28px_rgba(212,175,55,0.5)] disabled:opacity-70 group"
                                    >
                                        {phase === "submitting" ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm uppercase tracking-[0.3em] font-medium">
                                                    Opening…
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-sm uppercase tracking-[0.3em] font-medium">
                                                    Continue to Keystone
                                                </span>
                                                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[11px] text-cream/40 font-light max-w-[60%]">
                                        Strictly confidential · No spam · Unsubscribe anytime
                                    </p>
                                </div>
                            </form>
                        </>
                    )}

                    {phase === "confirming" && (
                        <div
                            className="py-6 text-center animate-fade-up"
                            data-testid="keystone-onboarding-confirm"
                        >
                            <div className="mx-auto h-16 w-16 rounded-full border border-gold/40 bg-gold/10 inline-flex items-center justify-center mb-6">
                                <Check className="h-7 w-7 text-gold" />
                            </div>
                            <h3 className="font-serif text-4xl text-cream leading-tight mb-3 tracking-tight">
                                Welcome to the <span className="italic gold-gradient-text">circle</span>.
                            </h3>
                            <p className="text-cream/65 font-light max-w-md mx-auto">
                                Opening your private Keystone destination in a new tab — your
                                application is reviewed within 48 hours.
                            </p>
                            <div className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-gold/85">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Opening Keystone
                            </div>
                            <div className="mt-7">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    data-testid="keystone-onboarding-finish-close"
                                    className="text-xs uppercase tracking-[0.3em] text-cream/55 hover:text-gold transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            </div>
        </div>
    );
}
