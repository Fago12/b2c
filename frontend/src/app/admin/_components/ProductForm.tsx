import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    stock: z.coerce.number().int().min(0, "Stock must be a non-negative integer"),
    categoryId: z.string().min(1, "Please select a category"),
    images: z.array(z.any()).min(1, "At least one image is required"),
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

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            stock: 0,
            categoryId: "",
            images: [],
            ...defaultValues,
        },
    });

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

    // Reset form when defaultValues change
    useEffect(() => {
        if (defaultValues) {
            form.reset({
                name: defaultValues.name || "",
                description: defaultValues.description || "",
                price: defaultValues.price || 0,
                stock: defaultValues.stock || 0,
                categoryId: defaultValues.categoryId || "",
                images: defaultValues.images || [],
            });
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
                                <Input placeholder="Product name" {...field} />
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
                                <Textarea placeholder="Product description" className="resize-none min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price (₦)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stock</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} />
                                </FormControl>
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
