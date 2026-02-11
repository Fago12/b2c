"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No verification token found.");
            return;
        }

        const verify = async () => {
            try {
                await fetchApi(`/auth/verify?token=${token}`);
                setStatus("success");
            } catch (err: any) {
                setStatus("error");
                setMessage(err.message || "Verification failed");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Email Verification</CardTitle>
                    <CardDescription>
                        {status === "loading" && "Verifying your email..."}
                        {status === "success" && "Email verified successfully!"}
                        {status === "error" && "Verification failed"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status === "error" && <p className="text-destructive mb-4">{message}</p>}
                    {status === "success" && (
                        <Button onClick={() => router.push("/login")} className="w-full">
                            Proceed to Login
                        </Button>
                    )}
                    {status === "error" && (
                        <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
                            Back to Login
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
