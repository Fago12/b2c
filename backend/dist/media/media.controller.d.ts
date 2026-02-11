import { MediaService } from './media.service';
export declare class MediaController {
    private mediaService;
    constructor(mediaService: MediaService);
    getUploadUrl(body: {
        metadata?: Record<string, string>;
    }): Promise<{
        uploadURL: string;
        id: string;
    }>;
    getImageUrl(imageId: string, variant?: string): {
        url: string;
    };
    deleteImage(imageId: string): Promise<{
        message: string;
    }>;
    listImages(page?: string, perPage?: string): Promise<any>;
    mockUpload(body: any): {
        id: string;
        url: string;
        success: boolean;
    };
}
