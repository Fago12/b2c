"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface User {
    id: string;
    email: string;
    name?: string;
    image?: string | null;
    emailVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { data: session, isPending: isLoading } = authClient.useSession();

    // Filter: If user is an Admin, we treat them as null for the Storefront context
    const rawUser = session?.user;
    const isAdmin = rawUser?.role === "ADMIN" || rawUser?.role === "SUPER_ADMIN";
    const user = isAdmin ? null : (rawUser || null);

    const logout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login");
                },
            },
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user: user ? { ...user, id: user.id || "" } : null,
                isAuthenticated: !!user,
                isLoading,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
