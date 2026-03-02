"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchApi, fetchAdminApi } from "@/lib/api";
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
    const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");
    const [isActive, setIsActive] = useState(true);

    const fetchHero = async () => {
        try {
            const data = await fetchAdminApi("/admin/homepage/heroes");
            // Assuming getHeroes returns array, we take the latest
            if (data && data.length > 0) {
                const latest = data[0];
                setHero(latest);
                setTitle(latest.title);
                setMediaType(latest.mediaType || "IMAGE");
                setIsActive(latest.isActive);
                setPreview(latest.mediaType === "VIDEO" ? latest.videoUrl : latest.imageUrl);
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
            formData.append("mediaType", mediaType);
            formData.append("isActive", String(isActive));

            if (file) {
                formData.append("image", file);
            }

            let url = "/admin/homepage/heroes";
            let method = "POST";

            if (hero && hero.id) {
                url = `/admin/homepage/heroes/${hero.id}`;
                method = "PATCH";
            }

            // Using fetchApi which now handles FormData correctly and includes Authorization header
            await fetchAdminApi(url, {
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
                        {/* Media Type Selection */}
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                            <Button
                                type="button"
                                variant={mediaType === "IMAGE" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setMediaType("IMAGE")}
                                className="px-6"
                            >
                                Image
                            </Button>
                            <Button
                                type="button"
                                variant={mediaType === "VIDEO" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setMediaType("VIDEO")}
                                className="px-6"
                            >
                                Video
                            </Button>
                        </div>

                        {/* Media Upload */}
                        <div className="space-y-2">
                            <Label>Hero {mediaType === "VIDEO" ? "Video" : "Image"}</Label>
                            <div className="border border-dashed rounded-lg p-4 bg-gray-50/50">
                                {preview ? (
                                    <div className="relative w-full aspect-video rounded overflow-hidden shadow-inner bg-black">
                                        {mediaType === "VIDEO" ? (
                                            <video src={preview} controls className="w-full h-full object-contain" />
                                        ) : (
                                            <Image src={preview} alt="Preview" fill className="object-cover" />
                                        )}
                                        {/* Overlay Button to change media */}
                                        <div className="absolute top-2 right-2 z-20">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => document.getElementById("hero-media-input")?.click()}
                                                className="shadow-lg h-8 text-xs"
                                            >
                                                <Upload className="w-3 h-3 mr-1" />
                                                Change {mediaType === "VIDEO" ? "Video" : "Image"}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="text-muted-foreground flex flex-col items-center justify-center w-full min-h-[200px] cursor-pointer hover:text-black transition-colors"
                                        onClick={() => document.getElementById("hero-media-input")?.click()}
                                    >
                                        <Upload className="w-8 h-8 mb-2 opacity-50" />
                                        <span className="text-sm font-medium">Click to upload {mediaType.toLowerCase()}</span>
                                    </div>
                                )}
                                <input
                                    id="hero-media-input"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept={mediaType === "VIDEO" ? "video/*" : "image/*"}
                                />
                            </div>
                        </div>

                        {/* Media Upload (as before) ... */}

                        {/* Status (as before) ... */}
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
