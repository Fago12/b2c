"use client";

import { Announcement } from "@/types/homepage";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface AnnouncementBarProps {
    announcement: Announcement | null;
}

export default function AnnouncementBar({ announcement }: AnnouncementBarProps) {
    if (!announcement || !announcement.isActive) return null;

    return (
        <div
            className="w-full py-2.5 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 relative z-50 transition-colors"
            style={{
                backgroundColor: announcement.backgroundColor,
                color: announcement.textColor
            }}
        >
            <span>{announcement.message}</span>
            {announcement.ctaText && announcement.ctaLink && (
                <Link
                    href={announcement.ctaLink}
                    className="underline underline-offset-4 hover:opacity-80 inline-flex items-center gap-1"
                >
                    {announcement.ctaText}
                    <ArrowRight className="w-3 h-3" />
                </Link>
            )}
        </div>
    );
}
