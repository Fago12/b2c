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
exports.AdminHomepageController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const better_auth_guard_1 = require("../auth/better-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
let AdminHomepageController = class AdminHomepageController {
    prisma;
    cloudinary;
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
    }
    async getSections() {
        const sections = await this.prisma.homepageSection.findMany({
            orderBy: { order: 'asc' }
        });
        return Promise.all(sections.map(async (section) => {
            let title = section.type.replace('_', ' ');
            if (section.referenceId) {
                try {
                    if (section.type === 'FEATURED') {
                        const coll = await this.prisma.featuredCollection.findUnique({ where: { id: section.referenceId } });
                        if (coll)
                            title = `Featured: ${coll.title}`;
                    }
                    else if (section.type === 'HERO') {
                        const hero = await this.prisma.heroSection.findUnique({ where: { id: section.referenceId } });
                        if (hero)
                            title = `Hero: ${hero.title}`;
                    }
                    else if (section.type === 'ANNOUNCEMENT') {
                        const ann = await this.prisma.announcement.findUnique({ where: { id: section.referenceId } });
                        if (ann)
                            title = `Announce: ${ann.message.slice(0, 20)}...`;
                    }
                }
                catch (e) {
                    console.error(`Failed to fetch title for ${section.type} ${section.referenceId}`, e);
                }
            }
            return { ...section, title };
        }));
    }
    async createSection(data) {
        return this.prisma.homepageSection.create({ data });
    }
    async reorderSections(items) {
        try {
            console.log(`[DEBUG] Reordering ${items.length} sections`);
            const results = [];
            for (const item of items) {
                await this.prisma.homepageSection.updateMany({
                    where: { id: item.id },
                    data: { order: item.order },
                });
            }
            return { success: true };
        }
        catch (error) {
            console.error(`[DEBUG] Reorder Error:`, error);
            throw error;
        }
    }
    async updateSection(id, data) {
        return this.prisma.homepageSection.update({
            where: { id },
            data,
        });
    }
    async deleteSection(id) {
        return this.prisma.homepageSection.delete({ where: { id } });
    }
    async getAnnouncements() {
        return this.prisma.announcement.findMany({ orderBy: { priority: 'desc' } });
    }
    async createAnnouncement(data) {
        return this.prisma.announcement.create({ data });
    }
    async updateAnnouncement(id, data) {
        return this.prisma.announcement.update({ where: { id }, data });
    }
    async deleteAnnouncement(id) {
        return this.prisma.announcement.delete({ where: { id } });
    }
    async getHeroes() {
        return this.prisma.heroSection.findMany({ orderBy: { updatedAt: 'desc' } });
    }
    async createHero(file, body) {
        const { title, isActive, mediaType } = body;
        let imageUrl = null;
        let videoUrl = null;
        if (file) {
            if (mediaType === 'VIDEO') {
                const upload = await this.cloudinary.uploadVideo(file);
                videoUrl = upload.secure_url;
            }
            else {
                const upload = await this.cloudinary.uploadImage(file);
                imageUrl = upload.secure_url;
            }
        }
        const heroData = {
            title,
            mediaType: mediaType || 'IMAGE',
            isActive: isActive === 'true' || isActive === true
        };
        if (imageUrl)
            heroData.imageUrl = imageUrl;
        if (videoUrl)
            heroData.videoUrl = videoUrl;
        return this.prisma.heroSection.create({
            data: heroData
        });
    }
    async updateHero(id, file, body) {
        console.log(`[CINEMA LOG] updateHero hit for ${id}`);
        try {
            const { title, isActive, mediaType } = body;
            let data = {};
            if (title !== undefined)
                data.title = title;
            if (mediaType !== undefined)
                data.mediaType = mediaType;
            if (isActive !== undefined) {
                data.isActive = isActive === 'true' || isActive === true;
            }
            if (file) {
                if (mediaType === 'VIDEO') {
                    const upload = await this.cloudinary.uploadVideo(file);
                    data.videoUrl = upload.secure_url;
                    data.imageUrl = null;
                }
                else {
                    const upload = await this.cloudinary.uploadImage(file);
                    data.imageUrl = upload.secure_url;
                    data.videoUrl = null;
                }
            }
            return await this.prisma.heroSection.update({
                where: { id },
                data
            });
        }
        catch (error) {
            console.error(`[AdminHomepageController] Update Hero Error:`, error);
            throw error;
        }
    }
    async getMarqueeItems() {
        return this.prisma.marqueeItem.findMany({ orderBy: { order: 'asc' } });
    }
    async createMarqueeItem(data) {
        return this.prisma.marqueeItem.create({ data });
    }
    async updateMarqueeItem(id, data) {
        return this.prisma.marqueeItem.update({ where: { id }, data });
    }
    async deleteMarqueeItem(id) {
        return this.prisma.marqueeItem.delete({ where: { id } });
    }
    async getFeaturedCollections() {
        return this.prisma.featuredCollection.findMany({ orderBy: { updatedAt: 'desc' } });
    }
    async createFeaturedCollection(data) {
        return this.prisma.featuredCollection.create({ data });
    }
    async updateFeaturedCollection(id, data) {
        return this.prisma.featuredCollection.update({ where: { id }, data });
    }
    async deleteFeaturedCollection(id) {
        return this.prisma.featuredCollection.delete({ where: { id } });
    }
    async getPromos() {
        return this.prisma.promoBanner.findMany({ orderBy: { updatedAt: 'desc' } });
    }
    async createPromo(file, body) {
        const { title, subtitle, ctaText, ctaLink, targetAudience, isActive } = body;
        let imageUrl = body.imageUrl;
        if (file) {
            const upload = await this.cloudinary.uploadImage(file);
            imageUrl = upload.secure_url;
        }
        return this.prisma.promoBanner.create({
            data: {
                title,
                subtitle,
                ctaText,
                ctaLink,
                targetAudience,
                imageUrl,
                isActive: isActive === 'true' || isActive === true
            }
        });
    }
    async updatePromo(id, file, body) {
        try {
            console.log(`[DEBUG] Updating Promo ${id}`, { body, file: !!file });
            const { title, subtitle, ctaText, ctaLink, targetAudience, isActive } = body;
            let data = {};
            if (title !== undefined)
                data.title = title;
            if (subtitle !== undefined)
                data.subtitle = subtitle;
            if (ctaText !== undefined)
                data.ctaText = ctaText;
            if (ctaLink !== undefined)
                data.ctaLink = ctaLink;
            if (targetAudience !== undefined)
                data.targetAudience = targetAudience;
            if (isActive !== undefined) {
                data.isActive = isActive === 'true' || isActive === true;
            }
            if (file) {
                const upload = await this.cloudinary.uploadImage(file);
                data.imageUrl = upload.secure_url;
            }
            else if (body.imageUrl) {
                data.imageUrl = body.imageUrl;
            }
            const result = await this.prisma.promoBanner.update({ where: { id }, data });
            console.log(`[DEBUG] Update Success:`, result.id);
            return result;
        }
        catch (error) {
            console.error(`[DEBUG] Update Promo Error:`, error);
            require('fs').appendFileSync('debug_upload.log', `[${new Date().toISOString()}] Promo Update Error ${id}: ${error.stack}\nBody: ${JSON.stringify(body)}\n\n`);
            throw error;
        }
    }
    async deletePromo(id) {
        return this.prisma.promoBanner.delete({ where: { id } });
    }
    async getFlashSales() {
        return this.prisma.flashSale.findMany({ orderBy: { updatedAt: 'desc' } });
    }
    async createFlashSale(data) {
        return this.prisma.flashSale.create({
            data: {
                ...data,
                endsAt: new Date(data.endsAt)
            }
        });
    }
    async updateFlashSale(id, data) {
        const updateData = { ...data };
        if (data.endsAt)
            updateData.endsAt = new Date(data.endsAt);
        return this.prisma.flashSale.update({ where: { id }, data: updateData });
    }
    async deleteFlashSale(id) {
        return this.prisma.flashSale.delete({ where: { id } });
    }
};
exports.AdminHomepageController = AdminHomepageController;
__decorate([
    (0, common_1.Get)('sections'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "getSections", null);
__decorate([
    (0, common_1.Post)('sections'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "createSection", null);
__decorate([
    (0, common_1.Patch)('sections/reorder'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "reorderSections", null);
__decorate([
    (0, common_1.Patch)('sections/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "updateSection", null);
__decorate([
    (0, common_1.Delete)('sections/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "deleteSection", null);
__decorate([
    (0, common_1.Get)('announcements'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "getAnnouncements", null);
__decorate([
    (0, common_1.Post)('announcements'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "createAnnouncement", null);
__decorate([
    (0, common_1.Patch)('announcements/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "updateAnnouncement", null);
__decorate([
    (0, common_1.Delete)('announcements/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "deleteAnnouncement", null);
__decorate([
    (0, common_1.Get)('heroes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "getHeroes", null);
__decorate([
    (0, common_1.Post)('heroes'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "createHero", null);
__decorate([
    (0, common_1.Patch)('heroes/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "updateHero", null);
__decorate([
    (0, common_1.Get)('marquee'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "getMarqueeItems", null);
__decorate([
    (0, common_1.Post)('marquee'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "createMarqueeItem", null);
__decorate([
    (0, common_1.Patch)('marquee/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "updateMarqueeItem", null);
__decorate([
    (0, common_1.Delete)('marquee/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "deleteMarqueeItem", null);
__decorate([
    (0, common_1.Get)('featured-collections'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "getFeaturedCollections", null);
__decorate([
    (0, common_1.Post)('featured-collections'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "createFeaturedCollection", null);
__decorate([
    (0, common_1.Patch)('featured-collections/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "updateFeaturedCollection", null);
__decorate([
    (0, common_1.Delete)('featured-collections/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "deleteFeaturedCollection", null);
__decorate([
    (0, common_1.Get)('promos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "getPromos", null);
__decorate([
    (0, common_1.Post)('promos'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "createPromo", null);
__decorate([
    (0, common_1.Patch)('promos/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "updatePromo", null);
__decorate([
    (0, common_1.Delete)('promos/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "deletePromo", null);
__decorate([
    (0, common_1.Get)('flash-sale'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "getFlashSales", null);
__decorate([
    (0, common_1.Post)('flash-sale'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "createFlashSale", null);
__decorate([
    (0, common_1.Patch)('flash-sale/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "updateFlashSale", null);
__decorate([
    (0, common_1.Delete)('flash-sale/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminHomepageController.prototype, "deleteFlashSale", null);
exports.AdminHomepageController = AdminHomepageController = __decorate([
    (0, common_1.Controller)('admin/homepage'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], AdminHomepageController);
//# sourceMappingURL=admin-homepage.controller.js.map