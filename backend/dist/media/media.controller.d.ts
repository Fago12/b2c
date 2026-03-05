import { MediaService } from './media.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class MediaController {
    private mediaService;
    private cloudinary;
    constructor(mediaService: MediaService, cloudinary: CloudinaryService);
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
    upload(file: Express.Multer.File): Promise<{
        url: any;
        id: any;
    }>;
    mockUpload(body: any): {
        id: string;
        url: string;
        success: boolean;
    };
}
