"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { fetchApi } from "@/lib/api";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const settingsSchema = z.object({
    storeName: z.string().min(2, "Store name must be at least 2 characters"),
    description: z.string().optional(),
    currency: z.string().min(3, "Currency code (e.g., NGN)"),
    supportEmail: z.string().email().optional().or(z.literal("")),
    // We can add social links later
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            storeName: "",
            description: "",
            currency: "NGN",
            supportEmail: "",
        },
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await fetchApi("/settings");
                if (data) {
                    form.reset({
                        storeName: data.storeName || "",
                        description: data.description || "",
                        currency: data.currency || "NGN",
                        supportEmail: data.supportEmail || "",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [form]);

    const onSubmit = async (data: SettingsFormValues) => {
        setSaving(true);
        try {
            await fetchApi("/settings", {
                method: "PATCH",
                body: JSON.stringify(data),
            });
            alert("Settings saved successfully"); // Fallback until toast is configured
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Store Settings</h1>
                <p className="text-muted-foreground">Manage your store's general configuration.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>
                        Correct store information is crucial for customer trust and SEO.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="storeName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Store Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="My Awesome Store" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell customers about your store..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            This will be displayed in the footer and meta tags.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Currency</FormLabel>
                                            <FormControl>
                                                <Input placeholder="NGN" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                ISO 4217 Currency Code.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="supportEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Support Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="support@example.com" type="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
