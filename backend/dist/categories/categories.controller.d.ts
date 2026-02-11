import { CategoriesService } from './categories.service';
import { Prisma } from '@prisma/client';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: Prisma.CategoryCreateInput): Prisma.Prisma__CategoryClient<{
        name: string;
        id: string;
        description: string | null;
        slug: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): Prisma.PrismaPromise<{
        name: string;
        id: string;
        description: string | null;
        slug: string;
    }[]>;
    findOne(id: string): Prisma.Prisma__CategoryClient<{
        name: string;
        id: string;
        description: string | null;
        slug: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateCategoryDto: Prisma.CategoryUpdateInput): Prisma.Prisma__CategoryClient<{
        name: string;
        id: string;
        description: string | null;
        slug: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): Prisma.Prisma__CategoryClient<{
        name: string;
        id: string;
        description: string | null;
        slug: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
