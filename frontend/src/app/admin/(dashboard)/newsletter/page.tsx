"use client";

import { useEffect, useState } from "react";
import { fetchAdminApi } from "@/lib/api";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, TrendingUp, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Subscriber {
    id: string;
    email: string;
    isActive: boolean;
    source: string;
    createdAt: string;
}

interface Stats {
    total: number;
    active: number;
}

export default function NewsletterAdminPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

    async function loadData() {
        try {
            const [listData, statsData] = await Promise.all([
                fetchAdminApi("/newsletter/admin/list"),
                fetchAdminApi("/newsletter/admin/stats"),
            ]);
            setSubscribers(listData.subscribers);
            setStats(statsData);
        } catch (err) {
            console.error("Failed to load newsletter data", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (email: string) => {
        if (!window.confirm(`Are you sure you want to delete ${email}? This will remove them from the database and the Brevo list.`)) {
            return;
        }

        setDeletingEmail(email);
        try {
            await fetchAdminApi("/newsletter/admin/delete", {
                method: "POST",
                body: JSON.stringify({ email }),
            });
            await loadData();
        } catch (err) {
            console.error("Failed to delete subscriber", err);
            alert("Failed to delete subscriber. Please try again.");
        } finally {
            setDeletingEmail(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-vogue font-bold uppercase tracking-widest text-[#480100]">Newsletter Management</h1>
                <p className="text-muted-foreground text-sm">Manage your email subscribers and track growth.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="rounded-none border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Total Subscribers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total || 0}</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Global Reach</p>
                    </CardContent>
                </Card>
                <Card className="rounded-none border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Active Contacts</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.active || 0}</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Synced with Brevo</p>
                    </CardContent>
                </Card>
                <Card className="rounded-none border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Growth</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">100%</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Organically Sourced</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-none border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-[12px] font-bold uppercase tracking-widest">Subscribers List</CardTitle>
                    <CardDescription className="text-[11px] uppercase tracking-wider">Latest signups from across the storefront.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="uppercase text-[10px] font-bold tracking-widest border-b border-black/5">
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Date Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscribers.map((sub) => (
                                <TableRow key={sub.id} className="text-xs group hover:bg-black/[0.02] transition-colors">
                                    <TableCell className="font-medium">{sub.email}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={sub.isActive ? "default" : "secondary"}
                                            className="rounded-none text-[9px] uppercase tracking-widest px-2"
                                        >
                                            {sub.isActive ? "Active" : "Unsubscribed"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="uppercase text-[10px] text-muted-foreground">{sub.source || "Unknown"}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {format(new Date(sub.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-600 transition-colors"
                                            onClick={() => handleDelete(sub.email)}
                                            disabled={deletingEmail === sub.email}
                                        >
                                            {deletingEmail === sub.email ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
