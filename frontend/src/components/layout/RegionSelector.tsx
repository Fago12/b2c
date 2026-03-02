"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { HeaderIconButton } from "../common/HeaderIconButton";
import { cn } from "@/lib/utils";
import { commerceApi } from "@/lib/api";
import { getRegionCodeClient, setRegionCode } from "@/lib/region";

interface Region {
    name: string;
    code: string;
    currency: string;
}

export function RegionSelector({ isScrolled }: { isScrolled: boolean }) {
    const [regions, setRegions] = useState<Region[]>([]);
    const [currentRegion, setCurrentRegion] = useState<string>("US");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setCurrentRegion(getRegionCodeClient());

        commerceApi.getRegions()
            .then(res => setRegions(res))
            .catch(err => console.error("Failed to fetch regions", err));
    }, []);

    const handleSelect = (code: string) => {
        setRegionCode(code);
        setCurrentRegion(code);
        // Reload to refresh all regional data and trigger server-side re-render with new cookies
        window.location.reload();
    };

    return (
        <DropdownMenu modal={false} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <HeaderIconButton isScrolled={isScrolled}>
                    <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-[11px] font-black tracking-tight">{currentRegion}</span>
                        <ChevronDown className={cn(
                            "h-3.5 w-3.5 transition-transform duration-300",
                            isOpen ? "rotate-180" : ""
                        )} />
                    </div>
                </HeaderIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none w-48 border-none bg-background/95 backdrop-blur-md shadow-2xl">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest opacity-50 border-b mb-1">Select Region</div>
                {regions.length === 0 ? (
                    <div className="px-2 py-1.5 text-[10px] uppercase font-bold opacity-30">Loading...</div>
                ) : regions.map((region) => (
                    <DropdownMenuItem
                        key={region.code}
                        onClick={() => handleSelect(region.code)}
                        className="flex items-center justify-between rounded-none uppercase text-[10px] tracking-widest font-bold cursor-pointer hover:bg-black hover:text-white transition-colors py-2"
                    >
                        <span>{region.name} ({region.currency})</span>
                        {currentRegion === region.code && <Check className="h-3 w-3" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
