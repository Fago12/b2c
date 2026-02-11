import { ProductsService } from './products.service';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class ProductsController {
    private readonly productsService;
    private readonly cloudinaryService;
    constructor(productsService: ProductsService, cloudinaryService: CloudinaryService);
    create(createProductDto: Prisma.ProductCreateInput): Prisma.Prisma__ProductClient<{
        id: string;
        createdAt: Date;
        name: string;
        price: number;
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        slug: string;
        tags: string[];
        attributes: Prisma.JsonValue | null;
        categoryId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): Prisma.PrismaPromise<({
        category: {
            id: string;
            name: string;
            description: string | null;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        price: number;
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        slug: string;
        tags: string[];
        attributes: Prisma.JsonValue | null;
        categoryId: string;
    })[]>;
    findOne(id: string): Prisma.Prisma__ProductClient<({
        category: {
            id: string;
            name: string;
            description: string | null;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        price: number;
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        slug: string;
        tags: string[];
        attributes: Prisma.JsonValue | null;
        categoryId: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateProductDto: Prisma.ProductUpdateInput): Prisma.Prisma__ProductClient<{
        category: {
            id: string;
            name: string;
            description: string | null;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        price: number;
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        slug: string;
        tags: string[];
        attributes: Prisma.JsonValue | null;
        categoryId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): Prisma.Prisma__ProductClient<{
        id: string;
        createdAt: Date;
        name: string;
        price: number;
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        slug: string;
        tags: string[];
        attributes: Prisma.JsonValue | null;
        categoryId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAllAdmin(search?: string, categoryId?: string, page?: string, limit?: string): Promise<{
        products: ({
            category: {
                id: string;
                name: string;
                description: string | null;
                slug: string;
            };
        } & {
            id: string;
            createdAt: Date;
            name: string;
            price: number;
            description: string;
            salePrice: number | null;
            stock: number;
            isActive: boolean;
            images: string[];
            slug: string;
            tags: string[];
            attributes: Prisma.JsonValue | null;
            categoryId: string;
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
            id: string;
            name: string;
            description: string | null;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        price: number;
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        slug: string;
        tags: string[];
        attributes: Prisma.JsonValue | null;
        categoryId: string;
    }>;
    updateProduct(id: string, files: Express.Multer.File[], data: any): Promise<{
        category: {
            id: string;
            name: string;
            description: string | null;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        price: number;
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        slug: string;
        tags: string[];
        attributes: Prisma.JsonValue | null;
        categoryId: string;
    }>;
    updateStock(id: string, stock: number): Promise<{
        category: {
            id: string;
            name: string;
            description: string | null;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        price: number;
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        slug: string;
        tags: string[];
        attributes: Prisma.JsonValue | null;
        categoryId: string;
    }>;
    deleteProduct(id: string): Prisma.Prisma__ProductClient<{
        id: string;
        createdAt: Date;
        name: string;
        price: number;
        description: string;
        salePrice: number | null;
        stock: number;
        isActive: boolean;
        images: string[];
        slug: string;
        tags: string[];
        attributes: Prisma.JsonValue | null;
        categoryId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
