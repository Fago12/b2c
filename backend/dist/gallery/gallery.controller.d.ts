import { GalleryService } from './gallery.service';
export declare class GalleryController {
    private readonly galleryService;
    constructor(galleryService: GalleryService);
    findAll(tag?: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.GalleryItemType;
        isActive: boolean;
        displayOrder: number;
        url: string;
        tag: string | null;
    }[]>;
    create(data: any): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.GalleryItemType;
        isActive: boolean;
        displayOrder: number;
        url: string;
        tag: string | null;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.GalleryItemType;
        isActive: boolean;
        displayOrder: number;
        url: string;
        tag: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.GalleryItemType;
        isActive: boolean;
        displayOrder: number;
        url: string;
        tag: string | null;
    }>;
}
