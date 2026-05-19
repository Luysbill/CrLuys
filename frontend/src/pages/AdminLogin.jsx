import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../lib/auth";
import { formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await login(email, password);
            toast.success("Welcome back.");
            navigate("/admin");
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main
            data-testid="admin-login-page"
            className="min-h-screen flex items-center justify-center p-5 sm:p-8 relative overflow-hidden"
        >
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-50 to-ink" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-gold/12 blur-[140px]" />
                <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-gold/8 blur-[120px]" />
            </div>
            <form
                onSubmit={onSubmit}
                data-testid="admin-login-form"
                className="relative w-full max-w-md bg-ink-100/85 backdrop-blur-2xl border border-gold/25 rounded-3xl p-9 sm:p-10 space-y-7 shadow-[0_30px_90px_-20px_rgba(212,175,55,0.25)] animate-fade-up"
            >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
                <div className="text-center">
                    <img
                        src="/crluys-logo.png"
                        alt="CrLuys Lifestyle"
                        className="brand-logo-soft h-16 w-auto mx-auto mb-5"
                        draggable={false}
                    />
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gold/85 mb-3">
                        Private Vault
                    </p>
                    <h1 className="font-serif text-4xl text-cream tracking-tight">
                        Welcome <span className="italic gold-gradient-text">back</span>.
                    </h1>
                </div>
                <div>
                    <label className="text-[10px] uppercase tracking-[0.35em] text-cream/55 mb-2 block">
                        Email
                    </label>
                    <div className="flex items-center gap-3 border-b border-gold/30 focus-within:border-gold focus-within:shadow-[0_4px_24px_-12px_rgba(212,175,55,0.4)] pb-2 transition-all duration-300">
                        <Mail className="h-4 w-4 text-gold" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vault@crluys.com"
                            autoComplete="email"
                            data-testid="admin-email"
                            className="flex-1 bg-transparent outline-none text-cream py-2 font-light placeholder-cream/30 tracking-tight"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] uppercase tracking-[0.35em] text-cream/55 mb-2 block">
                        Password
                    </label>
                    <div className="flex items-center gap-3 border-b border-gold/30 focus-within:border-gold focus-within:shadow-[0_4px_24px_-12px_rgba(212,175,55,0.4)] pb-2 transition-all duration-300">
                        <Lock className="h-4 w-4 text-gold" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            data-testid="admin-password"
                            className="flex-1 bg-transparent outline-none text-cream py-2 font-light placeholder-cream/30 tracking-widest"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    data-testid="admin-login-submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-gold text-ink hover:bg-gold-light transition-all duration-500 hover:shadow-[0_0_28px_rgba(212,175,55,0.5)] active:scale-[0.98] disabled:opacity-60"
                >
                    <span className="text-sm uppercase tracking-[0.3em] font-medium">
                        {submitting ? "Signing in…" : "Sign In"}
                    </span>
                </button>
                <p className="text-center text-[11px] text-cream/45 flex items-center justify-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-gold/70" />
                    Encrypted access · CrLuys private vault
                </p>
            </form>
        </main>
    );
}
