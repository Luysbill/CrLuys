import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient, tokenStore } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // null = checking, false = unauth, object = authed
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async () => {
        if (!tokenStore.get()) {
            setUser(false);
            setLoading(false);
            return;
        }
        try {
            const { data } = await apiClient.get("/auth/me");
            setUser(data);
        } catch {
            tokenStore.clear();
            setUser(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    const login = async (email, password) => {
        const { data } = await apiClient.post("/auth/login", { email, password });
        tokenStore.set(data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = async () => {
        try {
            await apiClient.post("/auth/logout");
        } catch {
            /* ignore */
        }
        tokenStore.clear();
        setUser(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refresh: fetchMe }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
