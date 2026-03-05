import { CmsService } from './cms.service';
export declare class CmsController {
    private readonly cmsService;
    constructor(cmsService: CmsService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        isActive: boolean;
        title: string;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    findBySlug(slug: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        isActive: boolean;
        title: string;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    create(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        isActive: boolean;
        title: string;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        isActive: boolean;
        title: string;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        isActive: boolean;
        title: string;
        content: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
