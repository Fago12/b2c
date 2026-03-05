"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchApi, fetchAdminApi } from "@/lib/api";
import { Loader2, Plus, Trash2, Save, Layout, Eye, EyeOff, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const SECTION_TYPES = [
    { value: 'ANNOUNCEMENT', label: 'Announcement Bar' },
    { value: 'HERO', label: 'Hero Banner' },
    { value: 'MARQUEE', label: 'Trust Strip (Marquee)' },
    { value: 'FEATURED', label: 'Featured Collection' },
    { value: 'PROMO', label: 'Promo Banners' },
    { value: 'NEW_ARRIVALS', label: 'New Arrivals' },
    { value: 'MOST_POPULAR', label: 'Most Popular' },
    { value: 'FLASH_SALE', label: 'Flash Sale' },
    { value: 'CATEGORIES', label: 'Categories Showcase' },
];

export default function HomepageLayoutPage() {
    const [sections, setSections] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [flashSales, setFlashSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // New Section State
    const [newType, setNewType] = useState<string>("");
    const [newReferenceId, setNewReferenceId] = useState<string>("");

    const fetchData = async () => {
        try {
            const [sectionsData, collectionsData, flashSalesData] = await Promise.all([
                fetchAdminApi("/admin/homepage/sections"),
                fetchAdminApi("/admin/featured-collections"), // Corrected if needed, or keeping your original
                fetchAdminApi("/admin/homepage/flash-sale")
            ]);
            setSections(sectionsData);
            setCollections(collectionsData);
            setFlashSales(flashSalesData);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async () => {
        if (!newType) return;

        if (newType === 'FEATURED' && !newReferenceId) {
            toast({ title: "Validation Error", description: "Please select a specific collection.", variant: "destructive" });
            return;
        }

        if (newType === 'FLASH_SALE' && !newReferenceId) {
            toast({ title: "Validation Error", description: "Please select a specific flash sale campaign.", variant: "destructive" });
            return;
        }

        try {
            await fetchAdminApi("/admin/homepage/sections", {
                method: "POST",
                body: JSON.stringify({
                    type: newType,
                    referenceId: newReferenceId || null,
                    order: sections.length,
                    isActive: true
                })
            });
            setNewType("");
            setNewReferenceId("");
            fetchData();
            toast({ title: "Success", description: "Section added to layout" });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this section from the page layout? This won't delete the content inside it, just the block on the homepage.")) return;
        try {
            await fetchAdminApi(`/admin/homepage/sections/${id}`, { method: "DELETE" });
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggle = async (section: any) => {
        try {
            await fetchAdminApi(`/admin/homepage/sections/${section.id}`, {
                method: "PATCH",
                body: JSON.stringify({ isActive: !section.isActive })
            });
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const onDragEnd = async (result: any) => {
        if (!result.destination) return;

        const newItems = Array.from(sections);
        const [reorderedItem] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, reorderedItem);

        // Update local state immediately for snappy UI
        setSections(newItems);

        // Prepare the full reordered list for the backend
        const reorderPayload = newItems.map((item, index) => ({
            id: item.id,
            order: index
        }));

        setSaving(true);
        try {
            await fetchAdminApi("/admin/homepage/sections/reorder", {
                method: "PATCH",
                body: JSON.stringify(reorderPayload)
            });
            toast({ title: "Success", description: "Layout order saved" });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save new order", variant: "destructive" });
            fetchData(); // Revert on failure
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Homepage Layout</h1>
                    <p className="text-muted-foreground">Master control for your storefront's page structure.</p>
                </div>
                <Layout className="h-10 w-10 text-muted-foreground opacity-20" />
            </div>

            {/* Quick Add Section */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Add New Layout Block</label>
                    <p className="text-xs text-muted-foreground">Select a component to add to the page. Blocks like 'Promo' or 'Collection' can be added multiple times.</p>
                    <Select value={newType} onValueChange={(val) => { setNewType(val); setNewReferenceId(""); }}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type to add to page..." />
                        </SelectTrigger>
                        <SelectContent>
                            {SECTION_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {newType === 'FEATURED' && (
                    <div className="flex-1 space-y-2 animate-in fade-in slide-in-from-left-2">
                        <label className="text-sm font-semibold text-slate-700">Specific Collection</label>
                        <Select value={newReferenceId} onValueChange={setNewReferenceId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Which collection?" />
                            </SelectTrigger>
                            <SelectContent>
                                {collections.map(c => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {newType === 'FLASH_SALE' && (
                    <div className="flex-1 space-y-2 animate-in fade-in slide-in-from-left-2">
                        <label className="text-sm font-semibold text-slate-700">Specific Campaign</label>
                        <Select value={newReferenceId} onValueChange={setNewReferenceId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Which flash sale?" />
                            </SelectTrigger>
                            <SelectContent>
                                {flashSales.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.title} ({s.id.slice(-4)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <Button
                    onClick={handleCreate}
                    disabled={!newType || saving}
                    className="bg-slate-900 border-0 hover:bg-slate-800 rounded-xl px-8 h-10"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add to Page
                </Button>
            </div>

            {/* Layout List */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-700 ml-1">Current Page Sequence</h3>
                <Badge variant="outline" className="text-slate-500 border-slate-200">
                    Live Sync Enabled
                </Badge>
            </div>
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="sections">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                <div className="grid grid-cols-[80px_1fr_150px_150px] bg-slate-50 border-b text-xs uppercase font-bold tracking-widest text-muted-foreground p-4">
                                    <div className="pl-2">Order</div>
                                    <div>Section Type</div>
                                    <div>Visibility</div>
                                    <div className="text-right pr-6">Management</div>
                                </div>

                                {sections.length === 0 ? (
                                    <div className="h-32 flex items-center justify-center text-muted-foreground">
                                        No sections added to your layout yet.
                                    </div>
                                ) : (
                                    sections.map((section, index) => (
                                        <Draggable key={section.id} draggableId={section.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`grid grid-cols-[80px_1fr_150px_150px] items-center p-4 border-b last:border-0 group transition-colors ${snapshot.isDragging ? "bg-blue-50/50 shadow-md ring-1 ring-blue-100" : "bg-white hover:bg-slate-50/50"
                                                        }`}
                                                >
                                                    <div className="pl-2 font-mono font-bold text-slate-400 flex items-center gap-2">
                                                        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors">
                                                            <GripVertical className="h-4 w-4" />
                                                        </div>
                                                        #{index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                                                <Layout className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="font-bold text-slate-900">
                                                                        {section.title || (SECTION_TYPES.find(t => t.value === section.type)?.label || section.type)}
                                                                    </div>
                                                                    {['MOST_POPULAR', 'NEW_ARRIVALS', 'FLASH_SALE'].includes(section.type) && (
                                                                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-blue-50 text-blue-600 border-blue-100 uppercase font-bold">
                                                                            Auto-Managed
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground uppercase tracking-tighter">
                                                                    ID: {section.id.slice(-6)} {section.referenceId && !['MOST_POPULAR', 'NEW_ARRIVALS', 'FLASH_SALE'].includes(section.type) && `| REF: ${section.referenceId.slice(-4)}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={section.isActive}
                                                                onCheckedChange={() => handleToggle(section)}
                                                                disabled={saving}
                                                            />
                                                            <span className="text-xs font-semibold">
                                                                {section.isActive ? (
                                                                    <span className="text-green-600 flex items-center gap-1"><Eye className="h-3 w-3" /> Visible</span>
                                                                ) : (
                                                                    <span className="text-slate-400 flex items-center gap-1"><EyeOff className="h-3 w-3" /> Hidden</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right pr-6">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDelete(section.id)}
                                                            disabled={saving || snapshot.isDragging}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                <div className="h-10 w-10 shrink-0 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <Save className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-bold text-blue-900">Auto-Save Enabled</h4>
                    <p className="text-blue-700 text-sm">Every change to the visibility or order is synced automatically with your database. No need to click save!</p>
                </div>
            </div>
        </div>
    );
}
