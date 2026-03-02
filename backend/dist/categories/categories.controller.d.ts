import { CategoriesService } from './categories.service';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class CategoriesController {
    private readonly categoriesService;
    private readonly cloudinary;
    constructor(categoriesService: CategoriesService, cloudinary: CloudinaryService);
    create(file: Express.Multer.File, body: any): Promise<{
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        isComingSoon: boolean;
        displayOrder: number;
        imageUrl: string | null;
    }>;
    findAll(isActive?: string): Prisma.PrismaPromise<{
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        isComingSoon: boolean;
        displayOrder: number;
        imageUrl: string | null;
    }[]>;
    test(): {
        ok: boolean;
        source: string;
    };
    findOne(id: string): Prisma.Prisma__CategoryClient<{
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        isComingSoon: boolean;
        displayOrder: number;
        imageUrl: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, file: Express.Multer.File, body: any): Promise<{
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        isComingSoon: boolean;
        displayOrder: number;
        imageUrl: string | null;
    }>;
    remove(id: string): Prisma.Prisma__CategoryClient<{
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        isComingSoon: boolean;
        displayOrder: number;
        imageUrl: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
