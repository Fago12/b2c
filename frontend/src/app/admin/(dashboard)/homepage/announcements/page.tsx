"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner"; // Assuming sonner

const announcementSchema = z.object({
    message: z.string().min(1, "Message is required"),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    backgroundColor: z.string().default("#000000"),
    textColor: z.string().default("#ffffff"),
    isActive: z.boolean().default(true),
    priority: z.coerce.number().default(0),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            message: "",
            ctaText: "",
            ctaLink: "",
            backgroundColor: "#000000",
            textColor: "#ffffff",
            isActive: true,
            priority: 0,
        },
    });

    const fetchAnnouncements = async () => {
        try {
            const data = await fetchApi("/admin/homepage/announcements");
            setAnnouncements(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const onSubmit = async (data: AnnouncementFormValues) => {
        try {
            if (editingId) {
                await fetchApi(`/admin/homepage/announcements/${editingId}`, {
                    method: "PATCH",
                    body: JSON.stringify(data),
                });
            } else {
                await fetchApi("/admin/homepage/announcements", {
                    method: "POST",
                    body: JSON.stringify(data),
                });
            }
            fetchAnnouncements();
            setIsDialogOpen(false);
            form.reset();
            setEditingId(null);
            // toast.success("Saved successfully");
        } catch (error) {
            console.error(error);
            // toast.error("Failed to save");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetchApi(`/admin/homepage/announcements/${id}`, { method: "DELETE" });
            fetchAnnouncements();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        form.reset({
            message: item.message,
            ctaText: item.ctaText || "",
            ctaLink: item.ctaLink || "",
            backgroundColor: item.backgroundColor,
            textColor: item.textColor,
            isActive: item.isActive,
            priority: item.priority
        });
        setIsDialogOpen(true);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Announcements</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) { setEditingId(null); form.reset(); }
                }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create New</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Announcement" : "New Announcement"}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="ctaText"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CTA Text (Optional)</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="ctaLink"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CTA Link (Optional)</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="backgroundColor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Background Color</FormLabel>
                                                <div className="flex gap-2">
                                                    <Input type="color" {...field} className="w-12 p-1" />
                                                    <Input {...field} />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="textColor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Text Color</FormLabel>
                                                <div className="flex gap-2">
                                                    <Input type="color" {...field} className="w-12 p-1" />
                                                    <Input {...field} />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                            <FormLabel>Active</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Save</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {announcements.map((item) => (
                    <Card key={item.id} className="flex flex-col md:flex-row justify-between items-center p-4">
                        <div
                            className="flex-1 p-2 rounded text-center w-full md:w-auto"
                            style={{ backgroundColor: item.backgroundColor, color: item.textColor }}
                        >
                            {item.message}
                            {item.ctaText && <span className="ml-2 underline text-xs">{item.ctaText}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0 ml-4">
                            <Badge variant={item.isActive ? "default" : "secondary"}>
                                {item.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function Badge({ children, variant }: { children: React.ReactNode, variant: "default" | "secondary" }) {
    return (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${variant === "default" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
            {children}
        </span>
    );
}
