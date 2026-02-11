"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallbackPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, login } = useAuth();

    useEffect(() => {
        // Trigger a re-check of auth in case cookies were just set
        login();
    }, [login]);

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.push("/");
            } else {
                // Give it a moment or redirect to login
                // Maybe check for error param
                const params = new URLSearchParams(window.location.search);
                if (params.get("error")) {
                    router.push("/login?error=" + params.get("error"));
                } else {
                    // Could be a race condition with cookie setting? 
                    // But redirect should handle it.
                    // If still not authenticated, user might have failed login
                    router.push("/login?error=social_login_failed");
                }
            }
        }
    }, [isAuthenticated, isLoading, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-semibold">Authenticating...</h2>
                <p className="text-muted-foreground">Please wait while we log you in.</p>
            </div>
        </div>
    );
}
