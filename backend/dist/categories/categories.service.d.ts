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
        isComingSoon: boolean;
        displayOrder: number;
        imageUrl: string | null;
    }>;
    findAll(isActive?: boolean): Prisma.PrismaPromise<{
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        isComingSoon: boolean;
        displayOrder: number;
        imageUrl: string | null;
    }[]>;
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
    update(id: string, updateCategoryDto: Prisma.CategoryUpdateInput): Promise<{
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
