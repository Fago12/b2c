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
        imageUrl: string | null;
        isComingSoon: boolean;
        displayOrder: number;
    }>;
    findAll(isActive?: string): Prisma.PrismaPromise<{
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        imageUrl: string | null;
        isComingSoon: boolean;
        displayOrder: number;
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
        imageUrl: string | null;
        isComingSoon: boolean;
        displayOrder: number;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, file: Express.Multer.File, body: any): Promise<{
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        imageUrl: string | null;
        isComingSoon: boolean;
        displayOrder: number;
    }>;
    remove(id: string): Prisma.Prisma__CategoryClient<{
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        imageUrl: string | null;
        isComingSoon: boolean;
        displayOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
