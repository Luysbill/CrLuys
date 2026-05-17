import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";
import { KeystoneOnboardingProvider } from "@/lib/keystone-onboarding";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import CategoryPage from "@/pages/CategoryPage";
import ProductPage from "@/pages/ProductPage";
import ContactPage from "@/pages/ContactPage";
import SmartInvestingPage from "@/pages/SmartInvestingPage";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import ProtectedRoute from "@/components/ProtectedRoute";

function Shell() {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith("/admin");
    return (
        <div className="bg-ink min-h-screen text-cream">
            {!isAdmin && <Header />}
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/smart-investing" element={<SmartInvestingPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
            {!isAdmin && <Footer />}
            <Toaster
                theme="dark"
                richColors
                position="top-right"
                toastOptions={{
                    style: {
                        background: "#141311",
                        border: "1px solid rgba(212,175,55,0.3)",
                        color: "#F8F6F0",
                    },
                }}
            />
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <KeystoneOnboardingProvider>
                    <Shell />
                </KeystoneOnboardingProvider>
            </BrowserRouter>
        </AuthProvider>
    );
}
