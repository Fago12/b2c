import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CommercePricingService } from '../commerce/pricing/pricing.service';
import { RegionService } from '../commerce/region/region.service';
export declare class ProductsService {
    private prisma;
    private pricingService;
    private regionService;
    constructor(prisma: PrismaService, pricingService: CommercePricingService, regionService: RegionService);
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
    findAllAdmin(params: {
        search?: string;
        categoryId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
    createProduct(data: {
        name: string;
        description: string;
        basePriceUSD_cents: number;
        salePriceUSD_cents?: number;
        stock: number;
        categoryId: string;
        productImages?: {
            imageUrl: string;
            sortOrder: number;
        }[];
        slug: string;
        tags?: string[];
        attributes?: any;
        hasVariants?: boolean;
        isActive?: boolean;
        weightKG?: number;
        variants?: any[];
    }): Promise<{
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
    updateProduct(id: string, data: {
        name?: string;
        description?: string;
        basePriceUSD_cents?: number;
        salePriceUSD_cents?: number;
        stock?: number;
        categoryId?: string;
        productImages?: {
            imageUrl: string;
            sortOrder: number;
        }[];
        tags?: string[];
        attributes?: any;
        hasVariants?: boolean;
        isActive?: boolean;
        slug?: string;
        variants?: any[];
        weightKG?: number;
    }): Promise<{
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
    getProductStats(): Promise<{
        total: number;
        inStock: number;
        lowStock: number;
        outOfStock: number;
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
    addVariant(productId: string, data: {
        colorId?: string;
        patternId?: string;
        color?: any;
        pattern?: any;
        size?: string;
        sku?: string;
        priceUSD_cents?: number;
        salePriceUSD_cents?: number;
        stock: number;
        imageUrl?: string;
        images?: {
            imageUrl: string;
            sortOrder: number;
        }[];
    }): Promise<{
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
}
