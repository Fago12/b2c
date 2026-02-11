"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Mail, Shield, User } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface TeamMember {
    id: string;
    name: string | null;
    email: string;
    role: string;
    isVerified: boolean;
    image: string | null;
}

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const fetchTeam = useCallback(async () => {
        setFetching(true);
        try {
            const data = await fetchApi("/admin/team");
            setMembers(data);
        } catch (error) {
            console.error("Failed to fetch team:", error);
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => {
        fetchTeam();
    }, [fetchTeam]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const data = await fetchApi("/admin/invite", {
                method: "POST",
                body: JSON.stringify({ email: inviteEmail }),
            });

            setMessage({ type: "success", text: data.message || "Invitation sent successfully!" });
            setInviteEmail("");
            setIsInviting(false);
            // Optionally refresh list if invite creates a pending user immediately (logic depends on backend)
        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.message || "Failed to send invitation.",
            });
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (role: string) => {
        if (role === "SUPER_ADMIN") return "bg-purple-100 text-purple-700";
        if (role === "ADMIN") return "bg-blue-100 text-blue-700";
        return "bg-gray-100 text-gray-700";
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage administrators and staff access</p>
                </div>
                <button
                    onClick={() => setIsInviting(!isInviting)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Invite Admin
                </button>
            </div>

            {message && (
                <div
                    className={`p-4 rounded-lg text-sm font-medium ${message.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                >
                    {message.text}
                </div>
            )}

            {isInviting && (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Invite New Administrator</h2>
                    <p className="text-sm text-slate-500 mt-1 mb-4">
                        They will receive an email with a link to set their password.
                    </p>
                    <form onSubmit={handleInvite} className="flex gap-4 items-end">
                        <div className="flex-1 max-w-md">
                            <label className="text-sm font-medium text-slate-700 mb-1 block">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="colleague@store.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Mail className="h-4 w-4" />
                            {loading ? "Sending..." : "Send Invitation"}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Administrators</h2>
                    <p className="text-sm text-slate-500 mt-1">Users with admin privileges</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {fetching ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                        Loading team members...
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                        No team members found.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs overflow-hidden">
                                                {member.image ? (
                                                    <img src={member.image} alt={member.name || "User"} className="h-full w-full object-cover" />
                                                ) : (
                                                    (member.name?.[0] || member.email[0]).toUpperCase()
                                                )}
                                            </div>
                                            {member.name || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{member.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(member.role)}`}>
                                                <Shield className="h-3 w-3" />
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${member.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {member.isVerified ? "Active" : "Pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

