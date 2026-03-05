"use client";

import React from "react";
import Image from "next/image";
import { Color, Pattern } from "@/types";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
    options: Record<string, any[]>;
    selections: Record<string, any>;
    onSelect: (name: string, value: any) => void;
    className?: string;
}

export function VariantSelector({ options, selections, onSelect, className }: VariantSelectorProps) {
    return (
        <div className={cn("space-y-8", className)}>
            {Object.entries(options).map(([name, values], sectionIdx) => (
                <div key={name} className="space-y-4">
                    <div className="flex justify-between items-baseline border-b border-black/5 pb-2">
                        <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                            {name}
                        </label>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium opacity-60">
                            {typeof selections[name] === 'string' ? selections[name] : (selections[name] as any)?.name}
                        </span>
                    </div>

                    {/* Container with padding to prevent border clipping */}
                    <div className="flex flex-wrap gap-4 px-1 py-1">
                        {values.map((val) => {
                            const valId = typeof val === 'string' ? val : val.id;
                            const isSelected = name === 'Size'
                                ? selections[name] === val
                                : (selections[name] as any)?.id === val.id;

                            // Color Circle Swatch
                            if (name === 'Color' && typeof val !== 'string') {
                                return (
                                    <button
                                        key={valId}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onSelect(name, val); }}
                                        className={cn(
                                            "w-12 h-12 rounded-full border-2 p-0.5 transition-all duration-300",
                                            isSelected ? "border-[#480100] scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                                        )}
                                        title={(val as Color).name}
                                    >
                                        <div
                                            className="w-full h-full rounded-full border border-black/10 shadow-inner"
                                            style={{ backgroundColor: (val as Color).hexCode }}
                                        />
                                    </button>
                                );
                            }

                            // Pattern Square Swatch
                            if (name === 'Pattern' && typeof val !== 'string') {
                                return (
                                    <button
                                        key={valId}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onSelect(name, val); }}
                                        className={cn(
                                            "w-14 h-14 border-2 p-0.5 transition-all duration-300 rounded-none",
                                            isSelected ? "border-[#480100] scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                                        )}
                                        title={(val as Pattern).name}
                                    >
                                        <div className="w-full h-full relative overflow-hidden bg-stone-100 border border-black/5">
                                            {(val as Pattern).previewImageUrl ? (
                                                <Image
                                                    src={(val as Pattern).previewImageUrl}
                                                    alt={(val as Pattern).name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-[8px] uppercase font-bold text-stone-400">{(val as Pattern).name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            }

                            // Size/Text Swatch
                            return (
                                <button
                                    key={valId}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); onSelect(name, val); }}
                                    className={cn(
                                        "px-6 h-12 text-[11px] uppercase tracking-[0.2em] font-bold border transition-all duration-300",
                                        isSelected
                                            ? "border-[#480100] bg-[#480100] text-white shadow-lg"
                                            : "border-stone-200 text-stone-800 hover:border-stone-400 hover:bg-stone-50"
                                    )}
                                >
                                    {typeof val === 'string' ? val : (val as any).name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
