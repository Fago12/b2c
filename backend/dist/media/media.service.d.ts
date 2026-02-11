import { ConfigService } from '@nestjs/config';
export interface UploadResponse {
    id: string;
    url: string;
    variants: string[];
}
export interface SignedUploadResponse {
    uploadURL: string;
    id: string;
}
export declare class MediaService {
    private configService;
    private readonly logger;
    private readonly accountId;
    private readonly apiToken;
    private readonly deliveryUrl;
    constructor(configService: ConfigService);
    getSignedUploadUrl(metadata?: Record<string, string>): Promise<SignedUploadResponse>;
    deleteImage(imageId: string): Promise<void>;
    getImageUrl(imageId: string, variant?: string): string;
    listImages(page?: number, perPage?: number): Promise<any>;
}
