"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { Loader2, Plus, Trash2, Edit, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import * as LucideIcons from "lucide-react";

// Helper to select icon
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function MarqueePage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // New Item State
    const [newItemText, setNewItemText] = useState("");
    const [newItemIcon, setNewItemIcon] = useState("check-circle");

    const fetchItems = async () => {
        try {
            const data = await fetchApi("/admin/homepage/marquee");
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleCreate = async () => {
        if (!newItemText) return;
        try {
            await fetchApi("/admin/homepage/marquee", {
                method: "POST",
                body: JSON.stringify({
                    text: newItemText,
                    icon: newItemIcon,
                    order: items.length,
                    isActive: true
                })
            });
            setNewItemText("");
            fetchItems();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetchApi(`/admin/homepage/marquee/${id}`, { method: "DELETE" });
            fetchItems();
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggle = async (item: any) => {
        try {
            await fetchApi(`/admin/homepage/marquee/${item.id}`, {
                method: "PATCH",
                body: JSON.stringify({ isActive: !item.isActive })
            });
            fetchItems();
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateOrder = async (item: any, newOrder: number) => {
        try {
            await fetchApi(`/admin/homepage/marquee/${item.id}`, {
                method: "PATCH",
                body: JSON.stringify({ order: newOrder })
            });
            fetchItems();
        } catch (error) {
            console.error(error);
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Trust Strip Management</h1>

            {/* Create New */}
            <div className="flex gap-4 items-end p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">Text</label>
                    <Input
                        value={newItemText}
                        onChange={e => setNewItemText(e.target.value)}
                        placeholder="e.g. Free Shipping"
                    />
                </div>
                <div className="space-y-2 w-48">
                    <label className="text-sm font-medium">Icon</label>
                    <Select value={newItemIcon} onValueChange={setNewItemIcon}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="truck">Truck</SelectItem>
                            <SelectItem value="globe">Globe</SelectItem>
                            <SelectItem value="rotate-ccw">Return</SelectItem>
                            <SelectItem value="check-circle">Check</SelectItem>
                            <SelectItem value="shield-check">Shield</SelectItem>
                            <SelectItem value="credit-card">Card</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleCreate} disabled={!newItemText}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </div>

            {/* List */}
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Icon</TableHead>
                            <TableHead>Text</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={item.order}
                                        className="w-16 h-8"
                                        onChange={(e) => handleUpdateOrder(item, parseInt(e.target.value))}
                                    />
                                </TableCell>
                                <TableCell>
                                    {/* Ideally render dynamic icon */}
                                    <span className="font-mono text-xs p-1 bg-gray-100 rounded">{item.icon}</span>
                                </TableCell>
                                <TableCell className="font-medium">{item.text}</TableCell>
                                <TableCell>
                                    <Switch checked={item.isActive} onCheckedChange={() => handleToggle(item)} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
