"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface User {
    id: string;
    email: string;
    name?: string;
    role?: string | null;
    image?: string | null;
    emailVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => void;
    login: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { data: session, isPending: isLoading, refetch } = authClient.useSession();

    // Filter: If user is an Admin, we treat them as null for the Storefront context
    const rawUser = session?.user;
    const isAdmin = (rawUser as any)?.role === "ADMIN" || (rawUser as any)?.role === "SUPER_ADMIN";
    const user = isAdmin ? null : (rawUser || null);

    const logout = async () => {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/login");
                    },
                },
            });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user: user ? { ...user, id: user.id || "" } : null,
                isAuthenticated: !!user,
                isLoading: isLoading || false,
                logout,
                login: refetch,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        // Log error with more context
        console.error("useAuth must be used within an AuthProvider");
        return {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            logout: () => console.warn("Logout called outside of AuthProvider"),
            login: () => console.warn("Login called outside of AuthProvider"),
        };
    }
    return context;
}
