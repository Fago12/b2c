"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { fetchAdminApi } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CMSImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
}

export function CMSImageUpload({ value, onChange, label }: CMSImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const data = await fetchAdminApi("/media/upload", {
                method: "POST",
                body: formData,
            });

            if (data.url) {
                onChange(data.url);
                toast.success("Image uploaded successfully");
            }
        } catch (error) {
            console.error("CMS Upload Error:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleClear = () => {
        onChange("");
    };

    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}

            <div className="relative group aspect-video md:aspect-[2/1] rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 hover:border-[#480100]/30 transition-all">
                {value ? (
                    <>
                        <Image
                            src={value}
                            alt="Preview"
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="p-2 bg-white rounded-full text-[#480100] cursor-pointer hover:bg-slate-100 transition-colors shadow-lg">
                                <Upload className="w-5 h-5" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                            <button
                                onClick={handleClear}
                                className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors shadow-lg"
                                type="button"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                        {uploading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-[#480100]/40" />
                        ) : (
                            <>
                                <div className="p-4 rounded-full bg-white shadow-sm mb-3">
                                    <ImageIcon className="w-6 h-6 text-[#480100]/60" />
                                </div>
                                <span className="text-sm font-medium text-slate-500">
                                    Click to upload image
                                </span>
                            </>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>
                )}
            </div>
        </div>
    );
}
