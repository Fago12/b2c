import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProductDto: Prisma.ProductCreateInput): Prisma.Prisma__ProductClient<{
        name: string;
        id: string;
        createdAt: Date;
        price: number;
        tags: string[];
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        slug: string;
        attributes: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): Prisma.PrismaPromise<({
        category: {
            name: string;
            id: string;
            description: string | null;
            slug: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        price: number;
        tags: string[];
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        slug: string;
        attributes: Prisma.JsonValue | null;
    })[]>;
    findOne(id: string): Prisma.Prisma__ProductClient<({
        category: {
            name: string;
            id: string;
            description: string | null;
            slug: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        price: number;
        tags: string[];
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        slug: string;
        attributes: Prisma.JsonValue | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findBySlug(slug: string): Prisma.Prisma__ProductClient<{
        name: string;
        id: string;
        createdAt: Date;
        price: number;
        tags: string[];
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        slug: string;
        attributes: Prisma.JsonValue | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateProductDto: Prisma.ProductUpdateInput): Prisma.Prisma__ProductClient<{
        category: {
            name: string;
            id: string;
            description: string | null;
            slug: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        price: number;
        tags: string[];
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        slug: string;
        attributes: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): Prisma.Prisma__ProductClient<{
        name: string;
        id: string;
        createdAt: Date;
        price: number;
        tags: string[];
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        slug: string;
        attributes: Prisma.JsonValue | null;
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
                description: string | null;
                slug: string;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            price: number;
            tags: string[];
            description: string;
            salePrice: number | null;
            stock: number;
            isActive: boolean;
            images: string[];
            categoryId: string;
            slug: string;
            attributes: Prisma.JsonValue | null;
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
        price: number;
        stock: number;
        categoryId: string;
        images: string[];
        tags?: string[];
        attributes?: any;
    }): Promise<{
        category: {
            name: string;
            id: string;
            description: string | null;
            slug: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        price: number;
        tags: string[];
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        slug: string;
        attributes: Prisma.JsonValue | null;
    }>;
    updateProduct(id: string, data: {
        name?: string;
        description?: string;
        price?: number;
        stock?: number;
        categoryId?: string;
        images?: string[];
        tags?: string[];
        attributes?: any;
    }): Promise<{
        category: {
            name: string;
            id: string;
            description: string | null;
            slug: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        price: number;
        tags: string[];
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        slug: string;
        attributes: Prisma.JsonValue | null;
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
            description: string | null;
            slug: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        price: number;
        tags: string[];
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        categoryId: string;
        slug: string;
        attributes: Prisma.JsonValue | null;
    }>;
}
