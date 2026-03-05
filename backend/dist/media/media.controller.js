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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const media_service_1 = require("./media.service");
const better_auth_guard_1 = require("../auth/better-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let MediaController = class MediaController {
    mediaService;
    cloudinary;
    constructor(mediaService, cloudinary) {
        this.mediaService = mediaService;
        this.cloudinary = cloudinary;
    }
    async getUploadUrl(body) {
        const result = await this.mediaService.getSignedUploadUrl(body.metadata);
        return {
            uploadURL: result.uploadURL,
            id: result.id,
        };
    }
    getImageUrl(imageId, variant) {
        return {
            url: this.mediaService.getImageUrl(imageId, variant),
        };
    }
    async deleteImage(imageId) {
        await this.mediaService.deleteImage(imageId);
        return { message: 'Image deleted successfully' };
    }
    async listImages(page, perPage) {
        return this.mediaService.listImages(parseInt(page || '1'), parseInt(perPage || '20'));
    }
    async upload(file) {
        const result = await this.cloudinary.uploadImage(file);
        return {
            url: result.secure_url,
            id: result.public_id,
        };
    }
    mockUpload(body) {
        const mockId = `mock-${Date.now()}`;
        return {
            id: mockId,
            url: `https://placehold.co/400x400?text=Uploaded`,
            success: true,
        };
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload-url'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getUploadUrl", null);
__decorate([
    (0, common_1.Get)(':imageId/url'),
    __param(0, (0, common_1.Param)('imageId')),
    __param(1, (0, common_1.Query)('variant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getImageUrl", null);
__decorate([
    (0, common_1.Delete)(':imageId'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard),
    __param(0, (0, common_1.Param)('imageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('perPage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "listImages", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('mock-upload'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "mockUpload", null);
exports.MediaController = MediaController = __decorate([
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [media_service_1.MediaService,
        cloudinary_service_1.CloudinaryService])
], MediaController);
//# sourceMappingURL=media.controller.js.map