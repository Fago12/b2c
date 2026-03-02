"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchApi, fetchAdminApi } from "@/lib/api";
import { Loader2, Plus, Trash2, Shield, Info, ArrowUp, ArrowDown } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function TrustSettingsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({ text: "", icon: "", isActive: true });

    const fetchItems = async () => {
        try {
            const data = await fetchAdminApi("/admin/homepage/marquee");
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

    const handleOpenDialog = (item: any = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({ text: item.text, icon: item.icon || "", isActive: item.isActive });
        } else {
            setEditingItem(null);
            setFormData({ text: "", icon: "", isActive: true });
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.text) return;

        try {
            if (editingItem) {
                await fetchAdminApi(`/admin/homepage/marquee/${editingItem.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(formData)
                });
            } else {
                await fetchAdminApi("/admin/homepage/marquee", {
                    method: "POST",
                    body: JSON.stringify({ ...formData, order: items.length })
                });
            }
            setDialogOpen(false);
            fetchItems();
            toast({ title: "Success", description: "Trust badge updated" });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this trust badge?")) return;
        try {
            await fetchAdminApi(`/admin/homepage/marquee/${id}`, { method: "DELETE" });
            fetchItems();
            toast({ title: "Deleted", description: "Badge removed successfully" });
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggle = async (item: any) => {
        try {
            await fetchAdminApi(`/admin/homepage/marquee/${item.id}`, {
                method: "PATCH",
                body: JSON.stringify({ isActive: !item.isActive })
            });
            fetchItems();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Trust & Branding</h1>
                    <p className="text-muted-foreground">Manage badges and trust markers shown across your site.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="rounded-xl">
                    <Plus className="mr-2 h-4 w-4" /> Add Badge
                </Button>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800">
                <Info className="h-5 w-5 shrink-0" />
                <p className="text-sm">These items are displayed in the <strong>Moving Marquee</strong> section on your homepage. Use them to highlight Free Shipping, Secure Payments, or Quality Guarantees.</p>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-12 pl-6">Order</TableHead>
                            <TableHead>Label</TableHead>
                            <TableHead>Icon Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No trust badges added yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="pl-6 font-mono text-slate-400">#{index + 1}</TableCell>
                                    <TableCell className="font-bold text-slate-900">{item.text}</TableCell>
                                    <TableCell className="font-mono text-xs">{item.icon || "—"}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={item.isActive}
                                            onCheckedChange={() => handleToggle(item)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(item)}>Edit</Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Trust Badge" : "Add Trust Badge"}</DialogTitle>
                        <DialogDescription>
                            Configure the message and icon for this trust marker.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="text">Display Text</Label>
                            <Input
                                id="text"
                                placeholder="e.g. Free Shipping Over $100"
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="icon">Lucide Icon Name (Optional)</Label>
                            <Input
                                id="icon"
                                placeholder="e.g. Truck, ShieldCheck, Heart"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            />
                            <p className="text-[10px] text-muted-foreground">Use any valid Lucide icon name (case-sensitive if applicable).</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Badge</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
