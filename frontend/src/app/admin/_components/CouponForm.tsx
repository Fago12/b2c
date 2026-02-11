"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { fetchApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

// ... imports

const couponSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters").regex(/^[A-Z0-9_-]+$/, "Code must be uppercase alphanumeric"),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    // coerce.number() handles string inputs from HTML forms
    value: z.coerce.number().min(0, "Value must be positive"),
    minOrderAmount: z.coerce.number().optional(),
    maxUses: z.coerce.number().optional(),
    expiresAt: z.string().optional(),
    isActive: z.boolean().default(true),
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponFormProps {
    initialData?: CouponFormValues & { id?: string }; // Better typing for initialData
    onSuccess: () => void;
}

// ... imports

export function CouponForm({ initialData, onSuccess }: CouponFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema) as any, // Cast to any to resolve strict type mismatch with RHF
        defaultValues: {
            code: initialData?.code || "",
            discountType: initialData?.discountType || "PERCENTAGE",
            value: initialData?.value || 0,
            // Handle nulls from database which explicitely break Zod's optional() which expects undefined
            minOrderAmount: initialData?.minOrderAmount ?? undefined,
            maxUses: initialData?.maxUses ?? undefined,
            expiresAt: initialData?.expiresAt ?? undefined,
            isActive: initialData?.isActive ?? true,
        },
    });

    const onSubmit = async (data: CouponFormValues) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                minOrderAmount: data.minOrderAmount || undefined,
                maxUses: data.maxUses || undefined,
                expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
            };

            if (initialData?.id) {
                await fetchApi(`/coupons/admin/${initialData.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                });
            } else {
                await fetchApi("/coupons/admin/create", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save coupon:", error);
            form.setError("root", { message: "Failed to save coupon" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Coupon Code</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="SUMMER2024"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                            </FormControl>
                            <FormDescription>Unique code for customers to enter at checkout.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="discountType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                        <SelectItem value="FIXED">Fixed Amount (₦)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Value</FormLabel>
                                <FormControl>
                                    {/* Using type="number" with z.coerce.number handles string->number conversion */}
                                    <Input type="number" placeholder="10" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="minOrderAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Min Order</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Optional" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="maxUses"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Max Uses</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Optional" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>Leave blank for no expiration.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Active Status</FormLabel>
                                <FormDescription>
                                    Disable to temporarily stop this coupon.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Update Coupon" : "Create Coupon"}
                </Button>
            </form>
        </Form>
    );
}
