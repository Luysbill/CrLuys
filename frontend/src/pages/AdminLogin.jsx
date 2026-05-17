import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "../lib/auth";
import { formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("admin@crluys.com");
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
            className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
        >
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-50 to-ink" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gold/10 blur-[120px]" />
            </div>
            <form
                onSubmit={onSubmit}
                data-testid="admin-login-form"
                className="w-full max-w-md bg-ink-100/80 backdrop-blur-xl border border-gold/20 rounded-3xl p-10 space-y-7"
            >
                <div className="text-center">
                    <img
                        src="/crluys-logo.png"
                        alt="CrLuys Lifestyle"
                        className="brand-logo-soft h-16 w-auto mx-auto mb-5"
                        draggable={false}
                    />
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gold/85 mb-3">
                        Admin Access
                    </p>
                    <h1 className="font-serif text-4xl text-cream tracking-tight">
                        Welcome <span className="italic gold-gradient-text">back</span>.
                    </h1>
                </div>
                <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-cream/55 mb-2 block">
                        Email
                    </label>
                    <div className="flex items-center gap-3 border-b border-gold/30 focus-within:border-gold pb-2">
                        <Mail className="h-4 w-4 text-gold" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            data-testid="admin-email"
                            className="flex-1 bg-transparent outline-none text-cream py-2 font-light"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-cream/55 mb-2 block">
                        Password
                    </label>
                    <div className="flex items-center gap-3 border-b border-gold/30 focus-within:border-gold pb-2">
                        <Lock className="h-4 w-4 text-gold" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            data-testid="admin-password"
                            className="flex-1 bg-transparent outline-none text-cream py-2 font-light"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    data-testid="admin-login-submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-gold text-ink hover:bg-gold-light transition-colors disabled:opacity-60"
                >
                    <span className="text-sm uppercase tracking-[0.3em] font-medium">
                        {submitting ? "Signing in…" : "Sign In"}
                    </span>
                </button>
                <p className="text-center text-xs text-cream/45">
                    Default seeded: admin@crluys.com · CrLuys2026!
                </p>
            </form>
        </main>
    );
}
