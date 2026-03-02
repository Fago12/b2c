import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Upload, X, Image as ImageIcon, Loader2, Settings, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { toast } from "sonner";

const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    basePrice: z.coerce.number().min(0, "Price must be a positive number"),
    salePrice: z.coerce.number().min(0, "Price must be a positive number").optional().or(z.literal(0)),
    stock: z.coerce.number().int().min(0, "Stock must be a non-negative integer"),
    categoryId: z.string().min(1, "Please select a category"),
    images: z.array(z.any()).min(1, "At least one image is required"),
    weightKG: z.coerce.number().min(0, "Weight must be a non-negative number").default(0),
    customizationOptions: z.object({
        embroidery: z.object({
            enabled: z.boolean().default(false),
            price: z.coerce.number().min(0).default(0),
        }).optional(),
        customColor: z.object({
            enabled: z.boolean().default(false),
        }).optional(),
        customerNote: z.object({
            enabled: z.boolean().default(false),
        }).optional(),
    }).optional(),
    options: z.record(z.string(), z.array(z.string())).optional(),
    hasVariants: z.boolean().default(false),
    variants: z.array(z.object({
        sku: z.string().min(1, "SKU is required"),
        priceUSD: z.coerce.number().min(0).optional(),
        salePriceUSD: z.coerce.number().min(0).optional(),
        stock: z.coerce.number().int().min(0),
        options: z.record(z.string(), z.string()),
        image: z.string().optional(),
    })).optional(),
    orderCount: z.number().optional(),
}).refine((data) => {
    // 1. Base Level Validation
    if (data.salePrice && data.salePrice > data.basePrice) return false;
    return true;
}, {
    message: "Sale price must be less than or equal to regular price",
    path: ["salePrice"],
}).refine((data) => {
    // 2. Variant Level Validation
    if (data.hasVariants && data.variants) {
        for (const v of data.variants) {
            const vBase = v.priceUSD || data.basePrice;
            if (v.salePriceUSD && v.salePriceUSD > vBase) return false;
        }
    }
    return true;
}, {
    message: "One or more variants have a sale price higher than their base price",
    path: ["variants"],
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
    defaultValues?: Partial<ProductFormValues>;
    categories: { id: string; name: string }[];
    onSubmit: (data: ProductFormValues) => Promise<void>;
    loading?: boolean;
    submitLabel?: string;
}

export function ProductForm({
    defaultValues,
    categories,
    onSubmit,
    loading,
    submitLabel = "Save Product",
}: ProductFormProps) {
    const [previews, setPreviews] = useState<string[]>([]);

    // Variant Management State
    const [localOptions, setLocalOptions] = useState<Array<{ name: string; values: string[] }>>(
        defaultValues?.options
            ? Object.entries(defaultValues.options).map(([name, values]) => ({ name, values }))
            : []
    );

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            basePrice: 0,
            stock: 0,
            salePrice: undefined,
            categoryId: "",
            images: [],
            weightKG: 0,
            hasVariants: defaultValues?.hasVariants || false,
            customizationOptions: {
                embroidery: { enabled: false, price: 0 },
                customColor: { enabled: false },
                customerNote: { enabled: false },
            },
            ...defaultValues,
        },
    });

    const images = form.watch("images") || [];
    const hasVariants = form.watch("hasVariants");
    const currentBasePrice = form.watch("basePrice");
    const hasOrders = (form.watch("orderCount") || 0) > 0;
    const variants = form.watch("variants") || [];

    // Sync previews with images
    useEffect(() => {
        const currentPreviews = images.map((img: any) => {
            if (typeof img === "string") return img;
            if (img instanceof File) return URL.createObjectURL(img);
            return "";
        }).filter(Boolean);

        setPreviews(currentPreviews);

        // Cleanup URLs
        return () => {
            currentPreviews.forEach(p => {
                if (p.startsWith("blob:")) URL.revokeObjectURL(p);
            });
        };
    }, [images]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            form.setValue("images", [...images, ...files], { shouldValidate: true });
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        form.setValue("images", newImages, { shouldValidate: true });
    };

    // Helper to display 0 for 0, otherwise empty string for null/undefined
    const valOrEmpty = (val: any) => (val === 0 ? 0 : val || "");

    // Cartesian Product Utility
    const generateVariants = () => {
        if (localOptions.length === 0) return;

        const cartesian = (arrays: string[][]): string[][] => {
            return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())), [[]] as string[][]);
        };

        const optionNames = localOptions.map(o => o.name);
        const optionValues = localOptions.map(o => o.values.filter(v => v.trim() !== ""));

        if (optionValues.some(v => v.length === 0)) return;

        const combinations = cartesian(optionValues);

        // Sync the options record for the schema
        const schemaOptions: Record<string, string[]> = {};
        localOptions.forEach(o => {
            if (o.name && o.values.length) schemaOptions[o.name] = o.values.filter(v => v.trim() !== "");
        });
        form.setValue("options", schemaOptions);

        const newVariants = combinations.map((combo, idx) => {
            const variantOptions: Record<string, string> = {};
            optionNames.forEach((name, i) => {
                variantOptions[name] = combo[i];
            });

            const sku = `${form.getValues("name").substring(0, 3).toUpperCase()}-${combo.join("-").toUpperCase()}`;

            return {
                sku,
                priceUSD: undefined,
                stock: form.getValues("stock") || 0,
                options: variantOptions,
            };
        });

        form.setValue("variants", newVariants);
    };

    // AUTO-SYNC: Sync the options record for the schema whenever localOptions change
    // This ensures data is always ready for submission even if "Generate" wasn't clicked last
    useEffect(() => {
        const schemaOptions: Record<string, string[]> = {};
        localOptions.forEach(o => {
            const validValues = o.values.filter(v => v.trim() !== "");
            if (o.name && validValues.length > 0) {
                schemaOptions[o.name] = validValues;
            }
        });

        // Deep compare or just set if changed? Simple setValue for now.
        form.setValue("options", schemaOptions);
    }, [localOptions, form]);
    // Reset form when defaultValues change
    useEffect(() => {
        if (defaultValues) {
            const rawBasePrice = (defaultValues as any).basePriceUSD || (defaultValues as any).basePrice || (defaultValues as any).price || 0;
            const rawSalePrice = (defaultValues as any).salePriceUSD || defaultValues.salePrice;

            // Standard Normalization: Always divide by 100
            const normalize = (val: number | undefined | null) => {
                if (val == null) return undefined;
                if (val === 0) return 0;
                return val / 100;
            };

            form.reset({
                name: defaultValues.name || "",
                description: defaultValues.description || "",
                basePrice: normalize(rawBasePrice),
                stock: defaultValues.stock || 0,
                salePrice: normalize(rawSalePrice),
                categoryId: defaultValues.categoryId || "",
                images: defaultValues.images || [],
                weightKG: (defaultValues as any).weightKG || 0,
                customizationOptions: defaultValues.customizationOptions ? {
                    ...defaultValues.customizationOptions,
                    embroidery: {
                        ...defaultValues.customizationOptions.embroidery,
                        price: normalize(defaultValues.customizationOptions.embroidery?.price)
                    }
                } : {
                    embroidery: { enabled: false, price: 0 },
                    customColor: { enabled: false },
                    customerNote: { enabled: false },
                },
                options: defaultValues.options || {},
                hasVariants: defaultValues.hasVariants || !!defaultValues.variants?.length || false,
                variants: (defaultValues.variants || []).map((v: any) => ({
                    ...v,
                    priceUSD: normalize(v.priceUSD),
                    salePriceUSD: normalize(v.salePriceUSD)
                })),
                orderCount: (defaultValues as any)?._count?.orderItems || 0,
            });

            if (defaultValues.options) {
                const optionsArray = Object.entries(defaultValues.options as Record<string, string[]>).map(([name, values]) => ({
                    name,
                    values: values
                }));
                setLocalOptions(optionsArray);
            }
        }
    }, [defaultValues, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Product name" {...field} value={field.value ?? ""} />
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
                                    placeholder="Product description"
                                    className="resize-none min-h-[100px]"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="basePrice"
                        render={({ field }) => {
                            const watchedVariants = useWatch({
                                control: form.control,
                                name: "variants"
                            }) || [];

                            const isManagingVariants = form.watch("hasVariants");

                            // Check for any "empty" price state
                            const affectedCount = watchedVariants.filter((v: any) => {
                                const p = v.priceUSD;
                                return p === undefined || p === null || p === "" || isNaN(p) || Number(p) === 0;
                            }).length;

                            return (
                                <FormItem>
                                    <FormLabel>Base Price (USD)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            {...field}
                                            className="h-12 text-lg font-bold bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                        />
                                    </FormControl>
                                    {isManagingVariants && watchedVariants.length > 0 && (
                                        <p className="text-[10px] text-amber-600 font-bold uppercase mt-1 animate-pulse">
                                            ⚠️ Note: Base price change only affects {affectedCount} variants currently set to "Inherit".
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />

                    <FormField
                        control={form.control}
                        name="salePrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sale Price (USD) <span className="text-[10px] text-muted-foreground uppercase font-bold ml-1 text-red-500">Optional</span></FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="$0.00"
                                        {...field}
                                        value={valOrEmpty(field.value)}
                                    />
                                </FormControl>
                                <FormDescription className="text-[10px]">Leave empty if not on sale.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stock Quantity</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder={form.watch("hasVariants") ? "Managed by variants" : "0"}
                                        {...field}
                                        value={valOrEmpty(field.value)}
                                        disabled={form.watch("hasVariants")}
                                        className={form.watch("hasVariants") ? "bg-muted cursor-not-allowed opacity-70" : ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="weightKG"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Weight (KG)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        value={valOrEmpty(field.value)}
                                    />
                                </FormControl>
                                <FormDescription className="text-[10px]">Used for weight-based international shipping. Rates vary by country.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4 border-t pt-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Customization Options
                    </h3>

                    <div className="grid gap-3">
                        <FormField
                            control={form.control}
                            name="customizationOptions.embroidery.enabled"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-2 border rounded-lg bg-muted/20 space-y-0">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-semibold">Enable Embroidery</FormLabel>
                                        <FormDescription className="text-[10px] leading-tight">Allow customers to add custom text embroidery.</FormDescription>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {field.value && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">Extra Price:</span>
                                                <FormField
                                                    control={form.control}
                                                    name="customizationOptions.embroidery.price"
                                                    render={({ field: priceField }) => (
                                                        <FormItem className="space-y-0">
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    className="h-8 w-24 text-xs"
                                                                    placeholder="$"
                                                                    {...priceField}
                                                                    value={priceField.value ?? ""}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                        <FormControl>
                                            <Switch
                                                checked={field.value ?? false}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customizationOptions.customColor.enabled"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-2 border rounded-lg bg-muted/20 space-y-0">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-semibold">Custom Color Request</FormLabel>
                                        <FormDescription className="text-[10px] leading-tight">Allow customers to request specific colors not in stock.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value ?? false}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customizationOptions.customerNote.enabled"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-2 border rounded-lg bg-muted/20 space-y-0">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-semibold">Customer Instruction Note</FormLabel>
                                        <FormDescription className="text-[10px] leading-tight">Add a text field for special handling or gift notes.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value ?? false}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                    <div className="p-4 bg-muted/20 border rounded-xl">
                        <FormField
                            control={form.control}
                            name="hasVariants"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between space-y-0">
                                    <div className="space-y-1">
                                        <FormLabel className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                            <Settings className="h-4 w-4" /> This product has variants
                                        </FormLabel>
                                        <FormDescription className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                            Enabling this makes variants the source of truth for stock.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <div className="flex flex-col items-end gap-1">
                                            <Switch
                                                checked={field.value}
                                                disabled={hasOrders}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked);
                                                    if (checked) {
                                                        form.setValue("stock", 0);
                                                    }
                                                    if (!checked) {
                                                        form.setValue("variants", []);
                                                        form.setValue("options", {});
                                                    }
                                                }}
                                            />
                                            {hasOrders && (
                                                <span className="text-[9px] text-amber-600 font-bold uppercase tracking-tighter">
                                                    Locked: Product has orders
                                                </span>
                                            )}
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {form.watch("hasVariants") && (
                        <div className="space-y-6">
                            {/* Options Builder */}
                            <div className="bg-muted/10 p-4 border rounded-xl space-y-4">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase">1. Define Options (e.g. Color, Size)</h4>
                                {localOptions.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex gap-3 items-start">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder="Option Name (e.g. Color)"
                                                value={opt.name}
                                                onChange={(e) => {
                                                    const newOpts = [...localOptions];
                                                    newOpts[optIdx].name = e.target.value;
                                                    setLocalOptions(newOpts);
                                                }}
                                                className="font-bold"
                                            />
                                            <Input
                                                placeholder="Values (comma separated: Red, Blue, Green)"
                                                value={opt.values.join(", ")}
                                                onChange={(e) => {
                                                    const newOpts = [...localOptions];
                                                    newOpts[optIdx].values = e.target.value.split(",").map(v => v.trim());
                                                    setLocalOptions(newOpts);
                                                }}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setLocalOptions(localOptions.filter((_, i) => i !== optIdx))}
                                        >
                                            <X className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setLocalOptions([...localOptions, { name: "", values: [] }])}
                                    >
                                        + Add Option
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={generateVariants}
                                        disabled={localOptions.length === 0}
                                        size="sm"
                                    >
                                        Generate Variant Table
                                    </Button>
                                </div>
                            </div>

                            {/* Variant Table */}
                            {form.watch("variants")?.length ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-bold text-muted-foreground uppercase">2. Manage Combinations</h4>
                                            <p className="text-[10px] text-muted-foreground">Prices left empty will inherit the base product price.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-[10px] h-8"
                                                onClick={() => {
                                                    const currentVariants = form.getValues("variants") || [];
                                                    const basePrice = form.getValues("basePrice");
                                                    const baseSalePrice = form.getValues("salePrice");
                                                    const baseStock = form.getValues("stock");

                                                    const updated = currentVariants.map(v => ({
                                                        ...v,
                                                        priceUSD: basePrice,
                                                        salePriceUSD: baseSalePrice,
                                                        stock: baseStock
                                                    }));
                                                    form.setValue("variants", updated);
                                                    toast.success("Applied base price, sale price, and stock as templates to all variants.");
                                                }}
                                            >
                                                Apply Base Template to All
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-[10px] h-8"
                                                onClick={() => {
                                                    const currentVariants = form.getValues("variants") || [];
                                                    const updated = currentVariants.map(v => ({
                                                        ...v,
                                                        priceUSD: undefined,
                                                        salePriceUSD: undefined
                                                    }));
                                                    form.setValue("variants", updated);
                                                    toast.success("All variants set to inherit base product prices.");
                                                }}
                                            >
                                                Clear to Inherit
                                            </Button>
                                            {form.watch("variants")!.length > 50 && (
                                                <span className="text-[10px] text-orange-500 font-bold self-center">⚠️ High variant count ({form.watch("variants")!.length})</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="border rounded-md overflow-hidden">
                                        <table className="w-full text-xs">
                                            <thead className="bg-muted/50 border-b">
                                                <tr>
                                                    <th className="p-2 text-left">Variant</th>
                                                    <th className="p-2 text-left">SKU</th>
                                                    <th className="p-2 text-left">Price (USD)</th>
                                                    <th className="p-2 text-left">Sale (USD)</th>
                                                    <th className="p-2 text-left">Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {form.watch("variants")?.map((variant, idx) => (
                                                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/10">
                                                        <td className="p-2">
                                                            <div className="flex flex-wrap gap-1">
                                                                {Object.entries(variant.options).map(([k, v]) => (
                                                                    <span key={k} className="bg-slate-100 px-1 rounded text-[9px] border">{v}</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                className="h-7 text-[10px] w-full"
                                                                {...form.register(`variants.${idx}.sku`)}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                type="number"
                                                                placeholder={form.watch("basePrice") ? `Inherit ($${form.watch("basePrice")})` : "Inherit"}
                                                                className="h-7 text-[10px] w-24"
                                                                {...form.register(`variants.${idx}.priceUSD`, { valueAsNumber: true })}
                                                                value={valOrEmpty(form.watch(`variants.${idx}.priceUSD`))}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                type="number"
                                                                placeholder={form.watch("salePrice") ? `Inherit ($${form.watch("salePrice")})` : "Optional"}
                                                                className="h-7 text-[10px] w-24"
                                                                {...form.register(`variants.${idx}.salePriceUSD`, { valueAsNumber: true })}
                                                                value={valOrEmpty(form.watch(`variants.${idx}.salePriceUSD`))}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                type="number"
                                                                className="h-7 text-[10px] w-16"
                                                                {...form.register(`variants.${idx}.stock`, { valueAsNumber: true })}
                                                                value={valOrEmpty(form.watch(`variants.${idx}.stock`))}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="images"
                    render={() => (
                        <FormItem>
                            <FormLabel>Product Images</FormLabel>
                            <FormControl>
                                <div className="grid grid-cols-4 gap-2">
                                    {previews.map((preview, index) => (
                                        <div key={index} className="relative group aspect-square rounded-md overflow-hidden border bg-slate-50">
                                            <Image src={preview} alt="Preview" fill className="object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                                        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Upload</span>
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                    </label>
                                </div>
                            </FormControl>
                            <FormMessage />
                            <FormDescription>
                                You can upload multiple images. The first one will be the primary image.
                            </FormDescription>
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {loading ? "Saving..." : submitLabel}
                </Button>
            </form>
        </Form>
    );
}
