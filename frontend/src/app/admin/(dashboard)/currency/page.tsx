"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Globe, DollarSign, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function CurrencyRatesPage() {
    const [rates, setRates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch rates
        setRates([
            { id: '1', currency: 'NGN', rate: 1600, isActive: true },
            { id: '2', currency: 'GHS', rate: 15.5, isActive: true },
            { id: '3', currency: 'INR', rate: 83.2, isActive: true },
        ]);
        setLoading(false);
    }, []);

    const addRate = () => {
        const newRate = {
            id: Date.now().toString(),
            currency: "NEW",
            rate: 1,
            isActive: true
        };
        setRates([...rates, newRate]);
    };

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Exchange Rates</h2>
                    <p className="text-muted-foreground">Manage conversion rates against USD.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" /> Sync Auto
                    </Button>
                    <Button onClick={addRate} className="bg-[#480100] hover:bg-[#480100]/90">
                        <Plus className="mr-2 h-4 w-4" /> Add Currency
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-[#480100]" />
                            Currency Control
                        </CardTitle>
                        <CardDescription>
                            All store base prices are in USD. These rates control display and conversion for other regions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {rates.map((rate, idx) => (
                                <div key={rate.id} className="flex items-center gap-6 p-4 border rounded-lg bg-muted/20">
                                    <div className="flex items-center gap-2 w-[120px]">
                                        <div className="p-2 bg-primary/10 rounded-full">
                                            <DollarSign className="h-4 w-4 text-primary" />
                                        </div>
                                        <Input
                                            className="font-bold border-none bg-transparent h-auto p-0 focus-visible:ring-0"
                                            value={rate.currency}
                                            onChange={(e) => {
                                                const newRates = [...rates];
                                                newRates[idx].currency = e.target.value.toUpperCase();
                                                setRates(newRates);
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1 flex items-center gap-4">
                                        <span className="text-sm text-muted-foreground">1 USD =</span>
                                        <Input
                                            type="number"
                                            className="max-w-[150px]"
                                            value={rate.rate}
                                            onChange={(e) => {
                                                const newRates = [...rates];
                                                newRates[idx].rate = parseFloat(e.target.value);
                                                setRates(newRates);
                                            }}
                                        />
                                        <span className="text-sm font-medium">{rate.currency}</span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">Active</span>
                                            <Switch
                                                checked={rate.isActive}
                                                onCheckedChange={(val) => {
                                                    const newRates = [...rates];
                                                    newRates[idx].isActive = val;
                                                    setRates(newRates);
                                                }}
                                            />
                                        </div>
                                        <Button variant="outline" size="icon" className="text-destructive" onClick={() => {
                                            setRates(rates.filter(r => r.id !== rate.id));
                                        }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" className="bg-[#480100] hover:bg-[#480100]/90 text-[#F7DFB9]" onClick={() => {
                                            toast.success(`Updated ${rate.currency} rate`);
                                        }}>
                                            <Save className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
