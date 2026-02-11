"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { Loader2, Save, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";

export default function HeroPage() {
    const [hero, setHero] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [ctaText, setCtaText] = useState("");
    const [ctaLink, setCtaLink] = useState("");
    const [isActive, setIsActive] = useState(true);

    const fetchHero = async () => {
        try {
            const data = await fetchApi("/admin/homepage/heroes");
            // Assuming getHeroes returns array, we take the latest
            if (data && data.length > 0) {
                const latest = data[0];
                setHero(latest);
                setTitle(latest.title);
                setSubtitle(latest.subtitle || "");
                setCtaText(latest.ctaText);
                setCtaLink(latest.ctaLink);
                setIsActive(latest.isActive);
                setPreview(latest.imageUrl);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHero();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("subtitle", subtitle);
            formData.append("ctaText", ctaText);
            formData.append("ctaLink", ctaLink);
            formData.append("isActive", String(isActive));

            if (file) {
                formData.append("image", file);
            } else if (hero) {
                formData.append("imageUrl", hero.imageUrl);
            }

            let url = "/admin/homepage/heroes";
            let method = "POST";

            if (hero && hero.id) {
                url = `/admin/homepage/heroes/${hero.id}`;
                method = "PATCH";
            }

            // Using fetchApi which now handles FormData correctly and includes Authorization header
            await fetchApi(url, {
                method,
                body: formData,
            });

            // Refresh
            fetchHero();
            alert("Saved successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold">Hero Section Management</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Main Hero Banner</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Hero Image</Label>
                            <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer relative">
                                {preview ? (
                                    <div className="relative w-full aspect-video rounded overflow-hidden">
                                        <Image src={preview} alt="Preview" fill className="object-cover" />
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground flex flex-col items-center">
                                        <Upload className="w-8 h-8 mb-2" />
                                        <span>Click to upload image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>Headline</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Collection 2024" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Subtitle</Label>
                                <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="e.g. up to 50% off" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>CTA Text</Label>
                                <Input value={ctaText} onChange={e => setCtaText(e.target.value)} placeholder="Shop Now" required />
                            </div>
                            <div className="space-y-2">
                                <Label>CTA Link</Label>
                                <Input value={ctaLink} onChange={e => setCtaLink(e.target.value)} placeholder="/products/category" required />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                            <Label htmlFor="active">Active Status</Label>
                        </div>

                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
