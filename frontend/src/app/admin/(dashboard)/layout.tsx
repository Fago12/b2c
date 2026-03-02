"use client";

import { useState } from "react";
import { AdminHeader } from "../_components/AdminHeader";
import { AdminSidebar } from "../_components/AdminSidebar";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-muted/40 font-sans admin-dashboard">
            <AdminSidebar isCollapsed={isCollapsed} />
            <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out">
                <AdminHeader
                    isCollapsed={isCollapsed}
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background/50 font-sans">
                    <div className="mx-auto max-w-[1600px]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
