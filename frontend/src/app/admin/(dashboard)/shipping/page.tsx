"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Globe, Truck, Save } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchAdminApi } from "@/lib/api";

export default function ShippingRatesPage() {
    const [config, setConfig] = useState<{
        usFlatRateInCents: number;
        nigeriaFlatRateInCents: number;
        indiaFlatRateInCents: number;
        ghanaFlatRateInCents: number;
        chinaFlatRateInCents: number;
        internationalFlatRateInCents: number;
    }>({
        usFlatRateInCents: 1500,
        nigeriaFlatRateInCents: 2500,
        indiaFlatRateInCents: 2500,
        ghanaFlatRateInCents: 2500,
        chinaFlatRateInCents: 2500,
        internationalFlatRateInCents: 2500,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await fetchAdminApi("/settings/shipping");
                if (data) {
                    setConfig({
                        usFlatRateInCents: data.usFlatRateInCents || 1500,
                        nigeriaFlatRateInCents: data.nigeriaFlatRateInCents || 2500,
                        indiaFlatRateInCents: data.indiaFlatRateInCents || 2500,
                        ghanaFlatRateInCents: data.ghanaFlatRateInCents || 2500,
                        chinaFlatRateInCents: data.chinaFlatRateInCents || 2500,
                        internationalFlatRateInCents: data.internationalFlatRateInCents || 2500,
                    });
                }
            } catch (err) {
                toast.error("Failed to load shipping settings");
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetchAdminApi("/settings/shipping", {
                method: "PATCH",
                body: JSON.stringify(config),
            });
            toast.success("Shipping rates updated successfully");
        } catch (err) {
            toast.error("Failed to update shipping rates");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-96 items-center justify-center text-muted-foreground animate-pulse font-sans tracking-widest uppercase text-xs">Loading logistics control...</div>
    }

    const shippingItems = [
        { key: 'usFlatRateInCents', label: 'United States', sub: 'Primary Market', color: 'blue' },
        { key: 'nigeriaFlatRateInCents', label: 'Nigeria', sub: 'Operating Region', color: 'green' },
        { key: 'ghanaFlatRateInCents', label: 'Ghana', sub: 'Operating Region', color: 'yellow' },
        { key: 'indiaFlatRateInCents', label: 'India', sub: 'Operating Region', color: 'orange' },
        { key: 'chinaFlatRateInCents', label: 'China', sub: 'Operating Region', color: 'red' },
        { key: 'internationalFlatRateInCents', label: 'Others (Rest of World)', sub: 'Global Coverage', color: 'slate' },
    ];

    return (
        <div className="flex-1 space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Shipping Rates</h2>
                    <p className="text-muted-foreground">Granular flat-rate control for all operating countries.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#480100] hover:bg-[#480100]/90 text-[#F7DFB9]"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving Changes..." : "Save All Rates"}
                </Button>
            </div>

            <div className="grid gap-6">
                <Card className="border-muted/60 shadow-sm">
                    <CardHeader className="bg-muted/30 pb-4 border-b">
                        <CardTitle className="flex items-center gap-2 text-[#480100] text-lg font-bold tracking-tight">
                            <Truck className="h-5 w-5" />
                            Country-Specific Logistics Control
                        </CardTitle>
                        <CardDescription>
                            Configure independent flat rates for your core markets and the rest of the world.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y border-b">
                            {shippingItems.map((item) => (
                                <div key={item.key} className="flex items-center gap-6 p-5 hover:bg-muted/10 transition-colors group">
                                    <div className={cn(
                                        "p-3 rounded-full shrink-0 group-hover:scale-110 transition-transform",
                                        item.color === 'blue' ? "bg-blue-500/10 text-blue-600" :
                                            item.color === 'green' ? "bg-emerald-500/10 text-emerald-600" :
                                                item.color === 'yellow' ? "bg-amber-500/10 text-amber-600" :
                                                    item.color === 'orange' ? "bg-orange-500/10 text-orange-600" :
                                                        item.color === 'red' ? "bg-rose-500/10 text-rose-600" : "bg-slate-500/10 text-slate-600"
                                    )}>
                                        <Globe className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 tracking-tight">{item.label}</h3>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">{item.sub}</p>
                                    </div>
                                    <div className="w-40 text-right">
                                        <label className="text-[9px] font-bold uppercase text-muted-foreground mb-1 block tracking-wider">Amount (USD)</label>
                                        <div className="relative group">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={((config as any)[item.key] / 100).toFixed(2)}
                                                onChange={(e) => {
                                                    const usd = parseFloat(e.target.value) || 0;
                                                    setConfig({
                                                        ...config,
                                                        [item.key]: Math.round(usd * 100)
                                                    });
                                                }}
                                                className="font-mono text-right pr-4 focus-visible:ring-[#480100]"
                                            />
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-1 font-medium bg-muted/50 py-0.5 px-2 rounded-full inline-block">
                                            {formatPrice((config as any)[item.key])}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#F7DFB9]/5 border-[#F7DFB9]/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-[#480100]/70">
                            <Truck className="h-3.5 w-3.5" /> Logical Flow Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-[11px] text-muted-foreground space-y-1.5 leading-relaxed list-disc pl-4">
                            <li><strong>Priority Check</strong>: The system verifies the customer country code against your operating list.</li>
                            <li><strong>Specific Overrides</strong>: If a customer is in Nigeria, India, Ghana, or China, the dedicated country rate is applied.</li>
                            <li><strong>Global Fallback</strong>: All other global destinations use the "Others" rate for uniform transparency.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
