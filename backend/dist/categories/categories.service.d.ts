import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCategoryDto: Prisma.CategoryCreateInput): Promise<{
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        imageUrl: string | null;
        isComingSoon: boolean;
        displayOrder: number;
    }>;
    findAll(isActive?: boolean): Prisma.PrismaPromise<{
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        imageUrl: string | null;
        isComingSoon: boolean;
        displayOrder: number;
    }[]>;
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
    update(id: string, updateCategoryDto: Prisma.CategoryUpdateInput): Promise<{
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
