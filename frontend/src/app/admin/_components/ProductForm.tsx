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
        imageUrl: z.string().optional(),
        imageIndex: z.number().optional(),
        variantFiles: z.array(z.any()).optional(),
        variantImages: z.array(z.object({ imageUrl: z.string(), sortOrder: z.number() })).optional(),
        size: z.string().nullable().optional(),
        color: z.object({ id: z.string().optional(), name: z.string(), hexCode: z.string() }).nullable().optional(),
        pattern: z.object({
            id: z.string().optional(),
            name: z.string(),
            previewImageUrl: z.any(),
            patternFile: z.any().optional()
        }).nullable().optional(),
    }).passthrough()).optional(),
    orderCount: z.number().optional(),
}).passthrough().refine((data) => {
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
    const [localOptions, setLocalOptions] = useState<Array<{
        name: string;
        type: 'standard' | 'color' | 'pattern';
        values: Array<{ name: string; hexCode?: string; previewImageUrl?: string; patternFile?: File }>
    }>>(
        defaultValues?.options
            ? Object.entries(defaultValues.options as Record<string, string[]>).map(([name, values]) => {
                const type = name.toLowerCase().includes('color') ? 'color' : name.toLowerCase().includes('pattern') ? 'pattern' : 'standard';
                return {
                    name,
                    type,
                    values: values.map(v => ({ name: v }))
                };
            })
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

    const [isGalleryOpen, setIsGalleryOpen] = useState<number | null>(null);

    const onVariantFilesChange = (idx: number, files: FileList | null) => {
        if (!files) return;
        const currentFiles = form.getValues(`variants.${idx}.variantFiles`) || [];
        form.setValue(`variants.${idx}.variantFiles`, [...currentFiles, ...Array.from(files)]);
    };

    const removeVariantFile = (vIdx: number, fIdx: number) => {
        const currentFiles = form.getValues(`variants.${vIdx}.variantFiles`) || [];
        const newFiles = [...currentFiles];
        newFiles.splice(fIdx, 1);
        form.setValue(`variants.${vIdx}.variantFiles`, newFiles);
    };

    const removeVariantImage = (vIdx: number, imgIdx: number) => {
        const currentImages = form.getValues(`variants.${vIdx}.variantImages`) || [];
        const newImages = [...currentImages];
        newImages.splice(imgIdx, 1);
        form.setValue(`variants.${vIdx}.variantImages`, newImages);
    };

    const images = form.watch("images") || [];

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

    const hasVariants = form.watch("hasVariants");
    const currentBasePrice = form.watch("basePrice");
    const hasOrders = (form.watch("orderCount") || 0) > 0;
    const variants = form.watch("variants") || [];

    // Helper to display 0 for 0, otherwise empty string for null/undefined
    const valOrEmpty = (val: any) => (val === 0 ? 0 : val || "");

    // Cartesian Product Utility
    const generateVariants = () => {
        if (localOptions.length === 0) return;

        const cartesian = (arrays: any[][]): any[][] => {
            return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())), [[]] as any[][]);
        };

        const optionNames = localOptions.map(o => o.name);
        const optionValues = localOptions.map(o => o.values.filter(v => v.name.trim() !== ""));

        if (optionValues.some(v => v.length === 0)) return;

        const combinations = cartesian(optionValues);

        // Sync the options record for the schema
        const schemaOptions: Record<string, string[]> = {};
        localOptions.forEach(o => {
            if (o.name && o.values.length) {
                schemaOptions[o.name] = o.values.filter(v => v.name.trim() !== "").map(v => v.name);
            }
        });
        form.setValue("options", schemaOptions);

        const newVariants = combinations.map((combo: any[], idx) => {
            const variantOptions: Record<string, string> = {};
            let variantColor = undefined;
            let variantPattern = undefined;
            let variantSize = undefined;

            optionNames.forEach((name, i) => {
                const val = combo[i];
                variantOptions[name] = val.name;

                if (name.toLowerCase() === 'color') {
                    variantColor = { name: val.name, hexCode: val.hexCode || '#000000', id: '' };
                } else if (name.toLowerCase() === 'pattern') {
                    variantPattern = {
                        name: val.name,
                        previewImageUrl: val.patternFile ? `__PATTERN_FILE_${i}__` : (val.previewImageUrl || ''),
                        id: ''
                    };
                    // We need to attach the file to the variant so the parent can find it
                    (variantPattern as any).patternFile = val.patternFile;
                } else if (name.toLowerCase() === 'size') {
                    variantSize = val.name;
                }
            });

            const comboNames = combo.map(v => v.name);
            const sku = `${form.getValues("name").substring(0, 3).toUpperCase()}-${comboNames.join("-").toUpperCase()}`;

            return {
                sku,
                priceUSD: undefined,
                stock: form.getValues("stock") || 0,
                options: variantOptions,
                color: variantColor,
                pattern: variantPattern,
                size: variantSize,
                variantFiles: [], // Initialize variantFiles
                variantImages: [], // Initialize variantImages
            };
        });

        form.setValue("variants", newVariants);
    };

    // AUTO-SYNC: Sync the options record for the schema whenever localOptions change
    useEffect(() => {
        const schemaOptions: Record<string, string[]> = {};
        localOptions.forEach(o => {
            const validValues = o.values.filter(v => v.name.trim() !== "").map(v => v.name);
            if (o.name && validValues.length > 0) {
                schemaOptions[o.name] = validValues;
            }
        });
        form.setValue("options", schemaOptions);

        // PROPAGATION: Update existing variants' metadata (color hex, pattern image) if their option names match
        const currentVariants = form.getValues("variants") || [];
        if (currentVariants.length > 0) {
            let changed = false;
            const updatedVariants = currentVariants.map(v => {
                const newV = { ...v };
                let vChanged = false;

                localOptions.forEach(opt => {
                    const optName = opt.name;
                    const selectedValName = v.options?.[optName];
                    if (!selectedValName) return;

                    const match = opt.values.find(ov => ov.name === selectedValName);
                    if (!match) return;

                    if (opt.type === 'color' && match.hexCode) {
                        if (!newV.color || newV.color.hexCode !== match.hexCode || newV.color.name !== match.name) {
                            newV.color = { ...newV.color, name: match.name, hexCode: match.hexCode };
                            vChanged = true;
                        }
                    } else if (opt.type === 'pattern') {
                        const hasFile = !!match.patternFile;
                        const previewUrl = match.previewImageUrl || '';

                        if (!newV.pattern || newV.pattern.previewImageUrl !== previewUrl || newV.pattern.name !== match.name) {
                            newV.pattern = {
                                ...newV.pattern,
                                name: match.name,
                                previewImageUrl: previewUrl
                            };

                            // Transfer file reference if present
                            if (hasFile) {
                                (newV.pattern as any).patternFile = match.patternFile;
                            }
                            vChanged = true;
                        }
                    }
                });

                if (vChanged) changed = true;
                return vChanged ? newV : v;
            });

            if (changed) {
                form.setValue("variants", updatedVariants, { shouldDirty: true });
            }
        }
    }, [localOptions, form]);

    // Reset form when defaultValues change
    useEffect(() => {
        if (defaultValues) {
            // Standard Normalization: Always divide by 100
            const normalize = (val: number | undefined | null) => {
                if (val == null || isNaN(Number(val))) return undefined;
                if (Number(val) === 0) return 0;
                return Number(val) / 100;
            };

            const rawBasePrice = (defaultValues as any).basePriceUSD_cents || (defaultValues as any).basePriceUSD || (defaultValues as any).basePrice || (defaultValues as any).price || 0;
            const rawSalePrice = (defaultValues as any).salePriceUSD_cents || (defaultValues as any).salePriceUSD || defaultValues.salePrice;

            form.reset({
                ...defaultValues,
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
                hasVariants: defaultValues.hasVariants || !!defaultValues.variants?.length || !!(defaultValues.legacyVariants as any)?.length || false,
                variants: (defaultValues.variants?.length ? defaultValues.variants : ((defaultValues.legacyVariants as any) || [])).map((v: any) => {
                    // Sanitize legacy color/pattern
                    let color = v.color;
                    if (typeof color === 'string') {
                        color = { id: '', name: color, hexCode: '#000000' };
                    } else if (color && typeof color === 'object') {
                        color = {
                            id: color.id || '',
                            name: color.name || 'Color',
                            hexCode: color.hexCode || '#000000'
                        };
                    }

                    let pattern = v.pattern;
                    if (typeof pattern === 'string') {
                        pattern = { id: '', name: 'Pattern', previewImageUrl: pattern };
                    } else if (pattern && typeof pattern === 'object') {
                        pattern = {
                            id: pattern.id || '',
                            name: pattern.name || 'Pattern',
                            previewImageUrl: pattern.previewImageUrl || ''
                        };
                    }

                    // If color/pattern are still empty but we have options, try to map from them
                    if (!color && v.options?.Color) color = { id: '', name: v.options.Color, hexCode: '#000000' };
                    if (!pattern && v.options?.Pattern) pattern = { id: '', name: v.options.Pattern, previewImageUrl: '' };

                    // Heal options if empty (crucial for uniqueness check)
                    const options = v.options && Object.keys(v.options).length > 0 ? { ...v.options } : {};
                    if (Object.keys(options).length === 0) {
                        if (color) options["Color"] = color.name;
                        if (pattern) options["Pattern"] = pattern.name;
                        if (v.size) options["Size"] = v.size;
                    }

                    return {
                        ...v,
                        sku: v.sku || `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`,
                        stock: v.stock !== undefined && v.stock !== null ? v.stock : 0,
                        size: v.size || "",
                        priceUSD: normalize(v.priceUSD_cents),
                        salePriceUSD: normalize(v.salePriceUSD_cents),
                        imageUrl: v.imageUrl || "",
                        options,
                        color,
                        pattern,
                        variantFiles: [], // Ensure this is initialized
                        variantImages: (v.images && v.images.length > 0) ? v.images : (v.imageUrl ? [{ imageUrl: v.imageUrl, sortOrder: 0 }] : []),
                    };
                }),
                orderCount: (defaultValues as any)?._count?.orderItems || 0,
            });

            if (defaultValues.options) {
                const optionsArray = Object.entries(defaultValues.options as Record<string, string[]>).map(([name, values]) => {
                    const type = name.toLowerCase().includes('color') ? 'color' : name.toLowerCase().includes('pattern') ? 'pattern' : 'standard';
                    return {
                        name,
                        type,
                        values: values.map(vName => {
                            let hexCode = undefined;
                            let previewImageUrl = undefined;

                            // Find metadata from variants
                            const variantWithVal = defaultValues.variants?.find((varObj: any) =>
                                varObj.options?.[name] === vName
                            );

                            if (variantWithVal) {
                                if (type === 'color' && variantWithVal.color) hexCode = variantWithVal.color.hexCode || '#000000';
                                if (type === 'pattern' && variantWithVal.pattern) previewImageUrl = variantWithVal.pattern.previewImageUrl || '';
                            }

                            return { name: vName, hexCode, previewImageUrl };
                        })
                    };
                });
                setLocalOptions(optionsArray as any);
            }
        }
    }, [defaultValues, form]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(
                    (data) => {
                        console.log("Form valid, final data to submit:", JSON.parse(JSON.stringify(data)));
                        onSubmit(data);
                    },
                    (errors) => {
                        console.error("Form validation failed. Details below:");

                        const logErrors = (obj: any, path = "") => {
                            if (!obj || typeof obj !== 'object') return;

                            if (obj.message) {
                                console.error(`❌ Error at [${path}]: ${obj.message}`, obj);
                            } else {
                                Object.entries(obj).forEach(([key, val]) => {
                                    logErrors(val, path ? `${path}.${key}` : key);
                                });
                            }
                        };

                        logErrors(errors);
                        console.log("Current Form Values for debugging:", form.getValues());
                        toast.error("Form validation failed. Please check the console (F12) for hidden error details.");
                    }
                )}
                className="space-y-4"
            >
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
                                    <div key={optIdx} className="p-4 border rounded-xl bg-white shadow-sm space-y-4 relative">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:bg-red-50"
                                            onClick={() => setLocalOptions(localOptions.filter((_, i) => i !== optIdx))}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>

                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Option Name</label>
                                                <Input
                                                    placeholder="e.g. Color, Size"
                                                    value={opt.name}
                                                    onChange={(e) => {
                                                        const newOpts = [...localOptions];
                                                        newOpts[optIdx].name = e.target.value;
                                                        setLocalOptions(newOpts);
                                                    }}
                                                    className="font-bold h-10"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Option Type</label>
                                                <Select
                                                    value={opt.type}
                                                    onValueChange={(val: any) => {
                                                        const newOpts = [...localOptions];
                                                        newOpts[optIdx].type = val;
                                                        setLocalOptions(newOpts);
                                                    }}
                                                >
                                                    <SelectTrigger className="h-10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="standard">Standard (Text)</SelectItem>
                                                        <SelectItem value="color">Color (Swatch)</SelectItem>
                                                        <SelectItem value="pattern">Pattern (Image)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Values</label>
                                            <div className="space-y-2">
                                                {opt.values.map((v, vIdx) => (
                                                    <div key={vIdx} className="flex gap-2 items-center">
                                                        <Input
                                                            placeholder="Value Name"
                                                            value={v.name}
                                                            onChange={(e) => {
                                                                const newOpts = [...localOptions];
                                                                newOpts[optIdx].values[vIdx].name = e.target.value;
                                                                setLocalOptions(newOpts);
                                                            }}
                                                            className="flex-1 h-9 text-xs"
                                                        />
                                                        {opt.type === 'color' && (
                                                            <div className="flex gap-2 items-center">
                                                                <Input
                                                                    type="color"
                                                                    value={v.hexCode || '#000000'}
                                                                    onChange={(e) => {
                                                                        const newOpts = [...localOptions];
                                                                        newOpts[optIdx].values[vIdx].hexCode = e.target.value;
                                                                        setLocalOptions(newOpts);
                                                                    }}
                                                                    className="w-10 h-9 p-1 cursor-pointer"
                                                                />
                                                                <Input
                                                                    placeholder="#000000"
                                                                    value={v.hexCode || ''}
                                                                    onChange={(e) => {
                                                                        const newOpts = [...localOptions];
                                                                        newOpts[optIdx].values[vIdx].hexCode = e.target.value;
                                                                        setLocalOptions(newOpts);
                                                                    }}
                                                                    className="w-24 h-9 text-[10px] font-mono"
                                                                />
                                                            </div>
                                                        )}
                                                        {opt.type === 'pattern' && (
                                                            <div className="flex gap-2 items-center">
                                                                <div className="relative group">
                                                                    <Input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        id={`pattern-upload-${optIdx}-${vIdx}`}
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                const newOpts = [...localOptions];
                                                                                newOpts[optIdx].values[vIdx].patternFile = file;
                                                                                newOpts[optIdx].values[vIdx].previewImageUrl = URL.createObjectURL(file);
                                                                                setLocalOptions(newOpts);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-9 px-2 text-[10px] flex gap-1 items-center"
                                                                        onClick={() => document.getElementById(`pattern-upload-${optIdx}-${vIdx}`)?.click()}
                                                                    >
                                                                        <Upload className="h-3 w-3" />
                                                                        {v.patternFile ? "Change" : "Upload"}
                                                                    </Button>
                                                                </div>
                                                                {(v.previewImageUrl || v.patternFile) && (
                                                                    <div className="w-9 h-9 rounded border overflow-hidden bg-slate-100 flex-shrink-0 relative group">
                                                                        <img
                                                                            src={(v.patternFile instanceof File) ? URL.createObjectURL(v.patternFile) : (v.previewImageUrl || '')}
                                                                            alt={v.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            onClick={() => {
                                                                                const newOpts = [...localOptions];
                                                                                newOpts[optIdx].values[vIdx].patternFile = undefined;
                                                                                newOpts[optIdx].values[vIdx].previewImageUrl = '';
                                                                                setLocalOptions(newOpts);
                                                                            }}
                                                                        >
                                                                            <X className="h-4 w-4 text-white" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-400 hover:text-red-500"
                                                            onClick={() => {
                                                                const newOpts = [...localOptions];
                                                                newOpts[optIdx].values = newOpts[optIdx].values.filter((_, i) => i !== vIdx);
                                                                setLocalOptions(newOpts);
                                                            }}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[10px] h-8 font-bold uppercase text-[#480100] hover:bg-[#480100]/5"
                                                    onClick={() => {
                                                        const newOpts = [...localOptions];
                                                        newOpts[optIdx].values.push({ name: "" });
                                                        setLocalOptions(newOpts);
                                                    }}
                                                >
                                                    + Add Value
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setLocalOptions([...localOptions, { name: "", type: "standard", values: [{ name: "" }] }])}
                                    >
                                        + Add Option Group
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
                                    <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
                                        <table className="w-full text-xs min-w-[1000px]">
                                            <thead className="bg-[#480100]/5 border-b border-[#480100]/10">
                                                <tr>
                                                    <th className="p-3 text-left font-semibold text-[#480100] w-[150px]">Variant Options</th>
                                                    <th className="p-3 text-left font-semibold text-[#480100] w-[80px]">Image</th>
                                                    <th className="p-3 text-center font-semibold text-[#480100] w-[180px]">SKU</th>
                                                    <th className="p-3 text-center font-semibold text-[#480100] w-[140px]">Price (USD)</th>
                                                    <th className="p-3 text-center font-semibold text-[#480100] w-[140px]">Sale Price (USD)</th>
                                                    <th className="p-3 text-center font-semibold text-[#480100] w-[120px]">Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {form.watch("variants")?.map((variant, idx) => (
                                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                                        <td className="p-3 align-middle">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {variant.options && Object.keys(variant.options).length > 0 ? (
                                                                    Object.entries(variant.options).map(([k, v]) => (
                                                                        <span key={k} className="bg-slate-50 px-2 py-0.5 rounded text-[10px] border border-slate-200 text-slate-600 font-medium">{k}: {v as string}</span>
                                                                    ))
                                                                ) : (
                                                                    <div className="flex gap-1.5">
                                                                        {(variant as any).size && <span className="bg-slate-50 px-2 py-0.5 rounded text-[10px] border border-slate-200 text-slate-600 font-medium">Size: {(variant as any).size}</span>}
                                                                        {(variant as any).color?.name && <span className="bg-slate-50 px-2 py-0.5 rounded text-[10px] border border-slate-200 text-slate-600 font-medium">Color: {(variant as any).color.name}</span>}
                                                                        {(variant as any).pattern?.name && <span className="bg-slate-50 px-2 py-0.5 rounded text-[10px] border border-slate-200 text-slate-600 font-medium">Pattern: {(variant as any).pattern.name}</span>}
                                                                        {(!variant.options || Object.keys(variant.options).length === 0) && !(variant as any).size && !(variant as any).color && !(variant as any).pattern && (
                                                                            <span className="text-[10px] text-slate-400 italic">No options</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 align-middle">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex flex-wrap gap-1 max-w-[120px]">
                                                                    {/* Existing Variant Images */}
                                                                    {form.watch(`variants.${idx}.variantImages`)?.map((img: any, i: number) => (
                                                                        <div key={`img-${i}`} className="h-8 w-8 rounded border relative group/v-img">
                                                                            <img src={img.imageUrl} className="w-full h-full object-cover rounded" />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeVariantImage(idx, i)}
                                                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/v-img:opacity-100 transition-opacity"
                                                                            >
                                                                                <X className="h-2 w-2" />
                                                                            </button>
                                                                        </div>
                                                                    ))}

                                                                    {/* New Variant Files */}
                                                                    {form.watch(`variants.${idx}.variantFiles`)?.map((file: File, i: number) => (
                                                                        <div key={`file-${i}`} className="h-8 w-8 rounded border relative group/v-img">
                                                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded" />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeVariantFile(idx, i)}
                                                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/v-img:opacity-100 transition-opacity"
                                                                            >
                                                                                <X className="h-2 w-2" />
                                                                            </button>
                                                                        </div>
                                                                    ))}

                                                                    {/* Add Button */}
                                                                    <label className="h-8 w-8 rounded border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                                                                        <Upload className="h-3 w-3 text-slate-400" />
                                                                        <input
                                                                            type="file"
                                                                            multiple
                                                                            className="hidden"
                                                                            accept="image/*"
                                                                            onChange={(e) => onVariantFilesChange(idx, e.target.files)}
                                                                        />
                                                                    </label>
                                                                </div>

                                                                {/* Fallback / Inheritance Trigger */}
                                                                {(!form.watch(`variants.${idx}.variantFiles`)?.length && !form.watch(`variants.${idx}.variantImages`)?.length) && (
                                                                    <Select
                                                                        onValueChange={(val) => {
                                                                            if (val === "none") {
                                                                                form.setValue(`variants.${idx}.imageUrl`, "");
                                                                                form.setValue(`variants.${idx}.imageIndex`, undefined);
                                                                            } else {
                                                                                const index = parseInt(val);
                                                                                form.setValue(`variants.${idx}.imageUrl`, previews[index]);
                                                                                form.setValue(`variants.${idx}.imageIndex`, index);
                                                                            }
                                                                        }}
                                                                        value={form.watch(`variants.${idx}.imageIndex`)?.toString() || (form.watch(`variants.${idx}.imageUrl`) ? "custom" : "")}
                                                                    >
                                                                        <SelectTrigger className="w-[80px] h-8 text-[9px] px-2">
                                                                            <SelectValue placeholder="Inherit" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="none">No Image</SelectItem>
                                                                            {previews.map((url, i) => (
                                                                                <SelectItem key={i} value={i.toString()}>
                                                                                    Base Img {i + 1}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 align-middle">
                                                            <FormField
                                                                control={form.control}
                                                                name={`variants.${idx}.sku`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <Input {...field} placeholder="SKU" className="h-9 font-mono text-[11px] bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#480100]/30 transition-all text-center" />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="p-3 align-middle">
                                                            <FormField
                                                                control={form.control}
                                                                name={`variants.${idx}.priceUSD`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                                                                <Input {...field} type="number" placeholder="Base" className="h-9 pl-5 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#480100]/30 transition-all text-center" />
                                                                            </div>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="p-3 align-middle">
                                                            <FormField
                                                                control={form.control}
                                                                name={`variants.${idx}.salePriceUSD`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                                                                <Input {...field} type="number" placeholder="Sale" className="h-9 pl-5 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#480100]/30 transition-all text-center" />
                                                                            </div>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="p-3 align-middle">
                                                            <FormField
                                                                control={form.control}
                                                                name={`variants.${idx}.stock`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <Input {...field} type="number" placeholder="Qty" className="h-9 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#480100]/30 transition-all text-center" />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
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
        </Form >
    );
}
