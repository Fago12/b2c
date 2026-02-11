"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let MediaService = MediaService_1 = class MediaService {
    configService;
    logger = new common_1.Logger(MediaService_1.name);
    accountId;
    apiToken;
    deliveryUrl;
    constructor(configService) {
        this.configService = configService;
        this.accountId = this.configService.get('CLOUDFLARE_ACCOUNT_ID') || '';
        this.apiToken = this.configService.get('CLOUDFLARE_API_TOKEN') || '';
        this.deliveryUrl = this.configService.get('CLOUDFLARE_IMAGES_URL')
            || 'https://imagedelivery.net';
    }
    async getSignedUploadUrl(metadata) {
        if (!this.accountId || !this.apiToken) {
            const mockId = `dev-${Date.now()}`;
            this.logger.warn('Cloudflare credentials not configured - using mock upload');
            return {
                uploadURL: `http://localhost:3001/media/mock-upload`,
                id: mockId,
            };
        }
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v2/direct_upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requireSignedURLs: false,
                metadata: metadata || {},
            }),
        });
        const data = await response.json();
        if (!data.success) {
            this.logger.error('Failed to get signed upload URL:', data.errors);
            throw new Error(data.errors?.[0]?.message || 'Failed to get upload URL');
        }
        return {
            uploadURL: data.result.uploadURL,
            id: data.result.id,
        };
    }
    async deleteImage(imageId) {
        if (!this.accountId || !this.apiToken) {
            this.logger.warn('Cloudflare credentials not configured - skipping delete');
            return;
        }
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
            },
        });
        const data = await response.json();
        if (!data.success) {
            this.logger.error('Failed to delete image:', data.errors);
            throw new Error(data.errors?.[0]?.message || 'Failed to delete image');
        }
        this.logger.log(`Deleted image: ${imageId}`);
    }
    getImageUrl(imageId, variant = 'public') {
        if (!this.accountId) {
            return `https://placehold.co/400x400?text=${imageId}`;
        }
        return `${this.deliveryUrl}/${this.accountId}/${imageId}/${variant}`;
    }
    async listImages(page = 1, perPage = 20) {
        if (!this.accountId || !this.apiToken) {
            return { images: [], total: 0 };
        }
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1?page=${page}&per_page=${perPage}`, {
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
            },
        });
        const data = await response.json();
        if (!data.success) {
            this.logger.error('Failed to list images:', data.errors);
            throw new Error(data.errors?.[0]?.message || 'Failed to list images');
        }
        return {
            images: data.result.images,
            total: data.result_info?.total_count || 0,
        };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map