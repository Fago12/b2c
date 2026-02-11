"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Package, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    const handleLogout = () => {
        logout();
    };

    if (!user) return <div className="container py-10">Loading...</div>;

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">My Account</h1>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" /> Profile
                        </CardTitle>
                        <CardDescription>Your account details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" /> Orders
                        </CardTitle>
                        <CardDescription>View your order history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/account/orders">View Orders</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-8" />

            <Button variant="destructive" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" /> Logout
            </Button>
        </div>
    );
}
