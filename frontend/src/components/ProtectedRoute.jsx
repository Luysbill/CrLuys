import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading || user === null) {
        return (
            <main className="min-h-screen flex items-center justify-center text-cream/65 text-sm uppercase tracking-[0.3em]">
                Authenticating…
            </main>
        );
    }
    if (!user) {
        return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }
    return children;
}
