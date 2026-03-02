"use client";

import {
    PanelLeftClose,
    PanelLeftOpen,
    CircleUser,
    Search,
    Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { MobileAdminSidebar } from "./AdminSidebar";
import { adminAuthClient } from "@/lib/admin-auth-client";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export function AdminHeader({ isCollapsed, onToggle }: AdminHeaderProps) {
    const router = useRouter();
    const { data: session } = adminAuthClient.useSession();

    const handleLogout = async () => {
        await adminAuthClient.signOut();
        router.push("/admin/login");
    };

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-3 lg:gap-4 shrink-0">
                <MobileAdminSidebar />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="hidden md:flex h-9 w-9 text-muted-foreground hover:text-accent-foreground transition-colors"
                >
                    {isCollapsed ? (
                        <PanelLeftOpen className="h-5 w-5" />
                    ) : (
                        <PanelLeftClose className="h-5 w-5" />
                    )}
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
            </div>

            <div className="w-full flex-1">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Quick search..."
                        className="w-full appearance-none bg-muted/50 pl-10 h-9 border-none focus-visible:ring-1 focus-visible:ring-[#480100] transition-all font-sans"
                    />
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-muted-foreground/20 overflow-hidden">
                        <CircleUser className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 font-sans">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1 px-1 py-1.5">
                            <span className="text-sm font-bold leading-none">{session?.user?.name || "Admin User"}</span>
                            <span className="text-xs text-muted-foreground font-normal leading-none truncate">{session?.user?.email}</span>
                            <div className="flex items-center pt-2">
                                <Shield className="h-3 w-3 mr-1 text-[#480100]" />
                                <span className="text-[10px] font-bold text-[#480100] uppercase tracking-widest">{session?.user?.role}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer uppercase text-[10px] font-bold tracking-widest">Account Settings</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer uppercase text-[10px] font-bold tracking-widest">Global Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive font-bold uppercase text-[10px] tracking-widest">
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
