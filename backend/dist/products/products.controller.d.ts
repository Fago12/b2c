import { ProductsService } from './products.service';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class ProductsController {
    private readonly productsService;
    private readonly cloudinaryService;
    constructor(productsService: ProductsService, cloudinaryService: CloudinaryService);
    create(createProductDto: Prisma.ProductCreateInput): Prisma.Prisma__ProductClient<{
        name: string;
        id: string;
        createdAt: Date;
        tags: string[];
        slug: string;
        description: string;
        basePriceUSD_cents: number;
        salePriceUSD_cents: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        attributes: Prisma.JsonValue | null;
        hasVariants: boolean;
        weightKG: number;
        options: Prisma.JsonValue | null;
        legacyVariants: Prisma.JsonValue | null;
        customizationOptions: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(regionCode?: string): Promise<{
        regional: {
            basePrice: number;
            finalPrice: number;
            currency: string;
            symbol: string;
            exchangeRateUsed: string;
            isOverride: boolean;
            variantId?: string;
        };
        category: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            imageUrl: string | null;
            isComingSoon: boolean;
            displayOrder: number;
        };
        productImages: {
            id: string;
            createdAt: Date;
            productId: string;
            imageUrl: string;
            sortOrder: number;
        }[];
        variants: ({
            color: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                hexCode: string;
            } | null;
            pattern: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                previewImageUrl: string;
            } | null;
            images: {
                id: string;
                createdAt: Date;
                imageUrl: string;
                variantId: string;
                sortOrder: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            salePriceUSD_cents: number | null;
            stock: number;
            options: Prisma.JsonValue | null;
            productId: string;
            colorId: string | null;
            patternId: string | null;
            size: string | null;
            priceUSD_cents: number | null;
            sku: string | null;
            imageUrl: string | null;
        })[];
        name: string;
        id: string;
        createdAt: Date;
        tags: string[];
        slug: string;
        description: string;
        basePriceUSD_cents: number;
        salePriceUSD_cents: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        attributes: Prisma.JsonValue | null;
        hasVariants: boolean;
        weightKG: number;
        options: Prisma.JsonValue | null;
        legacyVariants: Prisma.JsonValue | null;
        customizationOptions: Prisma.JsonValue | null;
    }[]>;
    findOneBySlug(slug: string, regionCode?: string): Promise<{
        regional: {
            basePrice: number;
            finalPrice: number;
            currency: string;
            symbol: string;
            exchangeRateUsed: string;
            isOverride: boolean;
            variantId?: string;
        };
        category: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            imageUrl: string | null;
            isComingSoon: boolean;
            displayOrder: number;
        };
        _count: {
            orderItems: number;
        };
        productImages: {
            id: string;
            createdAt: Date;
            productId: string;
            imageUrl: string;
            sortOrder: number;
        }[];
        variants: ({
            color: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                hexCode: string;
            } | null;
            pattern: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                previewImageUrl: string;
            } | null;
            images: {
                id: string;
                createdAt: Date;
                imageUrl: string;
                variantId: string;
                sortOrder: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            salePriceUSD_cents: number | null;
            stock: number;
            options: Prisma.JsonValue | null;
            productId: string;
            colorId: string | null;
            patternId: string | null;
            size: string | null;
            priceUSD_cents: number | null;
            sku: string | null;
            imageUrl: string | null;
        })[];
        name: string;
        id: string;
        createdAt: Date;
        tags: string[];
        slug: string;
        description: string;
        basePriceUSD_cents: number;
        salePriceUSD_cents: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        attributes: Prisma.JsonValue | null;
        hasVariants: boolean;
        weightKG: number;
        options: Prisma.JsonValue | null;
        legacyVariants: Prisma.JsonValue | null;
        customizationOptions: Prisma.JsonValue | null;
    }>;
    findAllAdmin(search?: string, categoryId?: string, page?: string, limit?: string): Promise<{
        products: ({
            category: {
                name: string;
                id: string;
                slug: string;
                description: string | null;
                isActive: boolean;
                imageUrl: string | null;
                isComingSoon: boolean;
                displayOrder: number;
            };
            _count: {
                orderItems: number;
            };
            productImages: {
                id: string;
                createdAt: Date;
                productId: string;
                imageUrl: string;
                sortOrder: number;
            }[];
            variants: ({
                color: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    hexCode: string;
                } | null;
                pattern: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    previewImageUrl: string;
                } | null;
                images: {
                    id: string;
                    createdAt: Date;
                    imageUrl: string;
                    variantId: string;
                    sortOrder: number;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                salePriceUSD_cents: number | null;
                stock: number;
                options: Prisma.JsonValue | null;
                productId: string;
                colorId: string | null;
                patternId: string | null;
                size: string | null;
                priceUSD_cents: number | null;
                sku: string | null;
                imageUrl: string | null;
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            tags: string[];
            slug: string;
            description: string;
            basePriceUSD_cents: number;
            salePriceUSD_cents: number | null;
            stock: number;
            isActive: boolean;
            images: string[];
            categoryId: string;
            attributes: Prisma.JsonValue | null;
            hasVariants: boolean;
            weightKG: number;
            options: Prisma.JsonValue | null;
            legacyVariants: Prisma.JsonValue | null;
            customizationOptions: Prisma.JsonValue | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getStats(): Promise<{
        total: number;
        inStock: number;
        lowStock: number;
        outOfStock: number;
    }>;
    createProduct(files: Express.Multer.File[], data: any): Promise<{
        category: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            imageUrl: string | null;
            isComingSoon: boolean;
            displayOrder: number;
        };
        productImages: {
            id: string;
            createdAt: Date;
            productId: string;
            imageUrl: string;
            sortOrder: number;
        }[];
        variants: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            salePriceUSD_cents: number | null;
            stock: number;
            options: Prisma.JsonValue | null;
            productId: string;
            colorId: string | null;
            patternId: string | null;
            size: string | null;
            priceUSD_cents: number | null;
            sku: string | null;
            imageUrl: string | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        tags: string[];
        slug: string;
        description: string;
        basePriceUSD_cents: number;
        salePriceUSD_cents: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        attributes: Prisma.JsonValue | null;
        hasVariants: boolean;
        weightKG: number;
        options: Prisma.JsonValue | null;
        legacyVariants: Prisma.JsonValue | null;
        customizationOptions: Prisma.JsonValue | null;
    }>;
    updateProduct(id: string, files: Express.Multer.File[], data: any): Promise<{
        category: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            imageUrl: string | null;
            isComingSoon: boolean;
            displayOrder: number;
        };
        productImages: {
            id: string;
            createdAt: Date;
            productId: string;
            imageUrl: string;
            sortOrder: number;
        }[];
        variants: ({
            images: {
                id: string;
                createdAt: Date;
                imageUrl: string;
                variantId: string;
                sortOrder: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            salePriceUSD_cents: number | null;
            stock: number;
            options: Prisma.JsonValue | null;
            productId: string;
            colorId: string | null;
            patternId: string | null;
            size: string | null;
            priceUSD_cents: number | null;
            sku: string | null;
            imageUrl: string | null;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        tags: string[];
        slug: string;
        description: string;
        basePriceUSD_cents: number;
        salePriceUSD_cents: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        attributes: Prisma.JsonValue | null;
        hasVariants: boolean;
        weightKG: number;
        options: Prisma.JsonValue | null;
        legacyVariants: Prisma.JsonValue | null;
        customizationOptions: Prisma.JsonValue | null;
    }>;
    updateStock(id: string, stock: number): Promise<{
        category: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            imageUrl: string | null;
            isComingSoon: boolean;
            displayOrder: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        tags: string[];
        slug: string;
        description: string;
        basePriceUSD_cents: number;
        salePriceUSD_cents: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        attributes: Prisma.JsonValue | null;
        hasVariants: boolean;
        weightKG: number;
        options: Prisma.JsonValue | null;
        legacyVariants: Prisma.JsonValue | null;
        customizationOptions: Prisma.JsonValue | null;
    }>;
    deleteProduct(id: string): Prisma.Prisma__ProductClient<{
        name: string;
        id: string;
        createdAt: Date;
        tags: string[];
        slug: string;
        description: string;
        basePriceUSD_cents: number;
        salePriceUSD_cents: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        attributes: Prisma.JsonValue | null;
        hasVariants: boolean;
        weightKG: number;
        options: Prisma.JsonValue | null;
        legacyVariants: Prisma.JsonValue | null;
        customizationOptions: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAllColors(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hexCode: string;
    }[]>;
    createColor(data: {
        name: string;
        hexCode: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        hexCode: string;
    }>;
    findAllPatterns(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        previewImageUrl: string;
    }[]>;
    createPattern(data: {
        name: string;
        previewImageUrl: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        previewImageUrl: string;
    }>;
    addVariant(productId: string, data: any): Promise<{
        color: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            hexCode: string;
        } | null;
        pattern: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            previewImageUrl: string;
        } | null;
        images: {
            id: string;
            createdAt: Date;
            imageUrl: string;
            variantId: string;
            sortOrder: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salePriceUSD_cents: number | null;
        stock: number;
        options: Prisma.JsonValue | null;
        productId: string;
        colorId: string | null;
        patternId: string | null;
        size: string | null;
        priceUSD_cents: number | null;
        sku: string | null;
        imageUrl: string | null;
    }>;
    findOne(id: string, regionCode?: string): Promise<{
        regional: {
            basePrice: number;
            finalPrice: number;
            currency: string;
            symbol: string;
            exchangeRateUsed: string;
            isOverride: boolean;
            variantId?: string;
        };
        category: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            imageUrl: string | null;
            isComingSoon: boolean;
            displayOrder: number;
        };
        _count: {
            orderItems: number;
        };
        productImages: {
            id: string;
            createdAt: Date;
            productId: string;
            imageUrl: string;
            sortOrder: number;
        }[];
        variants: ({
            color: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                hexCode: string;
            } | null;
            pattern: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                previewImageUrl: string;
            } | null;
            images: {
                id: string;
                createdAt: Date;
                imageUrl: string;
                variantId: string;
                sortOrder: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            salePriceUSD_cents: number | null;
            stock: number;
            options: Prisma.JsonValue | null;
            productId: string;
            colorId: string | null;
            patternId: string | null;
            size: string | null;
            priceUSD_cents: number | null;
            sku: string | null;
            imageUrl: string | null;
        })[];
        name: string;
        id: string;
        createdAt: Date;
        tags: string[];
        slug: string;
        description: string;
        basePriceUSD_cents: number;
        salePriceUSD_cents: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        attributes: Prisma.JsonValue | null;
        hasVariants: boolean;
        weightKG: number;
        options: Prisma.JsonValue | null;
        legacyVariants: Prisma.JsonValue | null;
        customizationOptions: Prisma.JsonValue | null;
    }>;
    update(id: string, updateProductDto: Prisma.ProductUpdateInput): Prisma.Prisma__ProductClient<{
        category: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            imageUrl: string | null;
            isComingSoon: boolean;
            displayOrder: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        tags: string[];
        slug: string;
        description: string;
        basePriceUSD_cents: number;
        salePriceUSD_cents: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        attributes: Prisma.JsonValue | null;
        hasVariants: boolean;
        weightKG: number;
        options: Prisma.JsonValue | null;
        legacyVariants: Prisma.JsonValue | null;
        customizationOptions: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): Prisma.Prisma__ProductClient<{
        name: string;
        id: string;
        createdAt: Date;
        tags: string[];
        slug: string;
        description: string;
        basePriceUSD_cents: number;
        salePriceUSD_cents: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        attributes: Prisma.JsonValue | null;
        hasVariants: boolean;
        weightKG: number;
        options: Prisma.JsonValue | null;
        legacyVariants: Prisma.JsonValue | null;
        customizationOptions: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
