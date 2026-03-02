"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, FileText, Edit2, Eye, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

export default function CmsPagesPage() {
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPage, setEditingPage] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    const loadPages = async () => {
        setLoading(true);
        try {
            const data = await fetchApi("/cms");
            setPages(data);
        } catch (error) {
            toast.error("Failed to load CMS pages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPages();
    }, []);

    const savePage = async () => {
        if (!editingPage.title || !editingPage.slug) {
            toast.error("Title and Slug are required");
            return;
        }

        setSaving(true);
        try {
            if (editingPage.id) {
                // Update
                await fetchApi(`/cms/${editingPage.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(editingPage)
                });
                toast.success(`Page "${editingPage.title}" updated successfully`);
            } else {
                // Create
                await fetchApi("/cms", {
                    method: 'POST',
                    body: JSON.stringify(editingPage)
                });
                toast.success(`Page "${editingPage.title}" created successfully`);
            }
            setEditingPage(null);
            loadPages();
        } catch (error: any) {
            toast.error(error.message || "Failed to save page");
        } finally {
            setSaving(false);
        }
    };

    const deletePage = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            await fetchApi(`/cms/${id}`, { method: 'DELETE' });
            toast.success(`Page "${title}" deleted`);
            loadPages();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete page");
        }
    };

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">CMS Pages</h2>
                    <p className="text-muted-foreground">Manage your website's static content and legal policies.</p>
                </div>
                <Button className="bg-[#480100] hover:bg-[#480100]/90" onClick={() => setEditingPage({ title: '', slug: '', content: '', isActive: true })}>
                    <Plus className="mr-2 h-4 w-4" /> Create New Page
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-[#480100]" />
                            Website Pages
                        </CardTitle>
                        <CardDescription>
                            Edit About Us, Mission, Policies, and other text-heavy pages.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : pages.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No pages found. Click "Create New Page" to add one.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pages.map((page) => (
                                    <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-[#480100]">{page.title}</h4>
                                                <Badge variant="outline" className="text-[10px] uppercase font-bold">/{page.slug}</Badge>
                                                {!page.isActive && <Badge variant="secondary" className="text-[10px] uppercase font-bold">Inactive</Badge>}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                                                {page.content.replace(/<[^>]*>/g, '')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 gap-2"
                                                onClick={() => window.open(`/${page.slug}`, '_blank')}
                                            >
                                                <Eye className="h-3 w-3" /> Preview
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 border-[#480100] text-[#480100] hover:bg-[#480100] hover:text-white"
                                                onClick={() => setEditingPage(page)}
                                            >
                                                <Edit2 className="h-3 w-3 mr-2" /> Edit content
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive h-8 w-8"
                                                onClick={() => deletePage(page.id, page.title)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {editingPage && (
                <Dialog open={!!editingPage} onOpenChange={(open) => !open && !saving && setEditingPage(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>{editingPage.id ? 'Edit Page Content' : 'Create New Page'}</DialogTitle>
                            <DialogDescription>
                                Update title, slug and the main content of the page.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-tight">Page Title</label>
                                    <Input
                                        value={editingPage.title}
                                        onChange={e => setEditingPage({ ...editingPage, title: e.target.value })}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-tight">Slug</label>
                                    <Input
                                        value={editingPage.slug}
                                        onChange={e => setEditingPage({ ...editingPage, slug: e.target.value })}
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editingPage.isActive}
                                    onChange={e => setEditingPage({ ...editingPage, isActive: e.target.checked })}
                                    disabled={saving}
                                />
                                <label htmlFor="isActive" className="text-xs font-bold uppercase tracking-tight cursor-pointer">Published / Active</label>
                            </div>
                            <div className="space-y-2 flex-1">
                                <label className="text-xs font-bold uppercase tracking-tight">Main Content (HTML/Markdown support)</label>
                                <div className="text-[10px] text-muted-foreground mb-1 italic">Note: Use HTML tags for formatting (e.g., &lt;h2&gt;, &lt;p&gt;)</div>
                                <Textarea
                                    className="min-h-[400px] font-mono text-xs leading-relaxed"
                                    value={editingPage.content}
                                    onChange={e => setEditingPage({ ...editingPage, content: e.target.value })}
                                    disabled={saving}
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-4 border-t">
                            <Button variant="ghost" onClick={() => setEditingPage(null)} disabled={saving}>Cancel</Button>
                            <Button className="bg-[#480100] text-[#F7DFB9]" onClick={savePage} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {editingPage.id ? 'Save Changes' : 'Create Page'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
