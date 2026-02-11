"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Search, ChevronLeft, ChevronRight, RefreshCw, Users, Shield, UserCheck, Eye } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface User {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    _count: { orders: number };
    orders?: Array<{
        id: string;
        total: number;
        status: string;
        createdAt: string;
    }>;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

interface Stats {
    total: number;
    admins: number;
    customers: number;
    verified: number;
    unverified: number;
}

export default function CustomersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, admins: 0, customers: 0, verified: 0, unverified: 0 });
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("CUSTOMER");

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("page", pagination.page.toString());
            params.append("limit", "10");
            if (roleFilter) params.append("role", roleFilter);
            if (search) params.append("search", search);

            const [usersData, statsData] = await Promise.all([
                fetchApi(`/users/admin/list?${params}`),
                fetchApi("/users/admin/stats"),
            ]);

            setUsers(usersData.users);
            setPagination(usersData.pagination);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, roleFilter, search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const openUserDetails = async (user: User) => {
        try {
            const fullUser = await fetchApi(`/users/admin/${user.id}`);
            setSelectedUser(fullUser);
            setSheetOpen(true);
        } catch (error) {
            console.error("Failed to fetch user details:", error);
        }
    };

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            SUPER_ADMIN: "bg-purple-100 text-purple-800",
            ADMIN: "bg-blue-100 text-blue-800",
            CUSTOMER: "bg-gray-100 text-gray-800",
        };
        return colors[role] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
                    <p className="text-muted-foreground">Manage users and customers</p>
                </div>
                <Button onClick={fetchUsers} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Users className="h-4 w-4" /> Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Shield className="h-4 w-4" /> Admins
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <UserCheck className="h-4 w-4" /> Verified
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Unverified</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.unverified}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={roleFilter || "all"} onValueChange={(v) => setRoleFilter(v === "all" ? "" : v)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="CUSTOMER">Customer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Orders</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Joined</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-slate-50">
                                            <td className="px-4 py-3">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                                    {user.isVerified ? "Verified" : "Unverified"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{user._count.orders}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button variant="ghost" size="sm" onClick={() => openUserDetails(user)}>
                                                    <Eye className="h-4 w-4 mr-1" /> View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <p className="text-sm text-muted-foreground">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* User Details Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    {selectedUser && (
                        <>
                            <SheetHeader>
                                <SheetTitle>User Details</SheetTitle>
                                <SheetDescription>{selectedUser.email}</SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Role</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(selectedUser.role)}`}>
                                            {selectedUser.role}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedUser.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                            {selectedUser.isVerified ? "Verified" : "Unverified"}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Joined</p>
                                    <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                </div>

                                {selectedUser.orders && selectedUser.orders.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Orders</h3>
                                        <div className="space-y-2">
                                            {selectedUser.orders.map((order) => (
                                                <div key={order.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                                    <div>
                                                        <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">₦{order.total.toLocaleString()}</p>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{order.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
