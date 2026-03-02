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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const client_1 = require("@prisma/client");
const better_auth_guard_1 = require("../auth/better-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let ProductsController = class ProductsController {
    productsService;
    cloudinaryService;
    constructor(productsService, cloudinaryService) {
        this.productsService = productsService;
        this.cloudinaryService = cloudinaryService;
    }
    create(createProductDto) {
        return this.productsService.create(createProductDto);
    }
    findAll(regionCode) {
        return this.productsService.findAll(regionCode);
    }
    findOne(id, regionCode) {
        return this.productsService.findOne(id, regionCode);
    }
    findOneBySlug(slug, regionCode) {
        return this.productsService.findOneBySlug(slug, regionCode);
    }
    update(id, updateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }
    remove(id) {
        return this.productsService.remove(id);
    }
    findAllAdmin(search, categoryId, page, limit) {
        const parsedPage = parseInt(page || '1');
        const parsedLimit = parseInt(limit || '10');
        return this.productsService.findAllAdmin({
            search,
            categoryId,
            page: isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
            limit: isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit,
        });
    }
    getStats() {
        return this.productsService.getProductStats();
    }
    async createProduct(files, data) {
        const imageUrls = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const upload = (await this.cloudinaryService.uploadImage(file));
                imageUrls.push(upload.secure_url);
            }
        }
        const safeParse = (val) => {
            if (typeof val !== 'string')
                return val;
            if (!val || val === 'undefined' || val === 'null')
                return undefined;
            try {
                return JSON.parse(val);
            }
            catch (e) {
                return undefined;
            }
        };
        const variants = safeParse(data.variants);
        const normalizedVariants = Array.isArray(variants) ? variants.map(v => ({
            ...v,
            priceUSD: (v.priceUSD != null && v.priceUSD !== '' && v.priceUSD !== 'null')
                ? Math.round(Number(v.priceUSD) * 100)
                : null,
            salePriceUSD: (v.salePriceUSD != null && v.salePriceUSD !== '' && v.salePriceUSD !== 'null')
                ? Math.round(Number(v.salePriceUSD) * 100)
                : null
        })) : undefined;
        const customizationOptions = safeParse(data.customizationOptions);
        if (customizationOptions?.embroidery) {
            const p = customizationOptions.embroidery.price;
            if (p != null && p !== '' && p !== 'null') {
                customizationOptions.embroidery.price = Math.round(Number(p) * 100);
            }
            else {
                customizationOptions.embroidery.price = 0;
            }
        }
        const hasVariants = data.hasVariants === 'true' || data.hasVariants === true;
        if (hasVariants) {
            if (!Array.isArray(normalizedVariants) || normalizedVariants.length === 0) {
                throw new common_1.HttpException('A product with variants must have at least one variant defined.', common_1.HttpStatus.BAD_REQUEST);
            }
            const combinations = new Set();
            for (const v of normalizedVariants) {
                if (v.stock === undefined || v.stock === null || isNaN(Number(v.stock))) {
                    throw new common_1.HttpException(`Variant ${v.sku || ''} is missing a valid stock quantity.`, common_1.HttpStatus.BAD_REQUEST);
                }
                const combo = JSON.stringify(v.options || {});
                if (combinations.has(combo)) {
                    throw new common_1.HttpException(`Duplicate variant detected with options: ${combo}`, common_1.HttpStatus.BAD_REQUEST);
                }
                combinations.add(combo);
            }
        }
        const basePriceUSD = data.basePrice ? Math.round(Number(data.basePrice) * 100) : (data.price ? Math.round(Number(data.price) * 100) : 0);
        const salePriceUSD = (data.salePrice && data.salePrice !== 'null') ? Math.round(Number(data.salePrice) * 100) : null;
        if (salePriceUSD != null && salePriceUSD > basePriceUSD) {
            throw new common_1.HttpException('Base sale price cannot be higher than base price.', common_1.HttpStatus.BAD_REQUEST);
        }
        if (hasVariants && normalizedVariants) {
            for (const v of normalizedVariants) {
                const vPrice = v.priceUSD || basePriceUSD;
                if (v.salePriceUSD != null && v.salePriceUSD > vPrice) {
                    throw new common_1.HttpException(`Variant ${v.sku || ''} sale price ($${v.salePriceUSD / 100}) cannot be greater than its price ($${vPrice / 100}).`, common_1.HttpStatus.BAD_REQUEST);
                }
            }
        }
        const productData = {
            name: data.name,
            description: data.description,
            basePriceUSD,
            salePriceUSD,
            stock: hasVariants ? 0 : (data.stock ? Number(data.stock) : 0),
            images: imageUrls,
            slug: data.slug || data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            tags: safeParse(data.tags),
            attributes: safeParse(data.attributes),
            customizationOptions,
            options: safeParse(data.options),
            variants: normalizedVariants,
            hasVariants: hasVariants,
            isActive: data.isActive === 'false' ? false : true,
            weightKG: data.weightKG ? Number(data.weightKG) : 0,
        };
        return this.productsService.createProduct({
            ...productData,
            categoryId: data.categoryId
        });
    }
    async updateProduct(id, files, data) {
        const newImageUrls = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const upload = (await this.cloudinaryService.uploadImage(file));
                newImageUrls.push(upload.secure_url);
            }
        }
        const safeParse = (val) => {
            if (typeof val !== 'string')
                return val;
            if (!val || val === 'undefined' || val === 'null')
                return undefined;
            try {
                return JSON.parse(val);
            }
            catch (e) {
                return undefined;
            }
        };
        let finalImages = newImageUrls;
        const existingImages = safeParse(data.existingImages || data.images);
        if (Array.isArray(existingImages)) {
            finalImages = [...existingImages, ...newImageUrls];
        }
        const productData = {};
        if (data.name)
            productData.name = data.name;
        if (data.description)
            productData.description = data.description;
        if (data.basePrice || data.price) {
            productData.basePriceUSD = Math.round(Number(data.basePrice || data.price) * 100);
        }
        if (data.salePrice !== undefined) {
            productData.salePriceUSD = data.salePrice === 'null' ? null : Math.round(Number(data.salePrice) * 100);
        }
        if (data.stock !== undefined)
            productData.stock = Number(data.stock);
        if (finalImages.length > 0 || data.existingImages)
            productData.images = finalImages;
        if (data.tags)
            productData.tags = safeParse(data.tags);
        if (data.attributes)
            productData.attributes = safeParse(data.attributes);
        if (data.customizationOptions) {
            const customizationOptions = safeParse(data.customizationOptions);
            if (customizationOptions?.embroidery) {
                const p = customizationOptions.embroidery.price;
                if (p != null && p !== '' && p !== 'null') {
                    customizationOptions.embroidery.price = Math.round(Number(p) * 100);
                }
                else {
                    customizationOptions.embroidery.price = 0;
                }
            }
            productData.customizationOptions = customizationOptions;
        }
        if (data.options)
            productData.options = safeParse(data.options);
        if (data.weightKG !== undefined)
            productData.weightKG = Number(data.weightKG);
        if (data.variants) {
            const variants = safeParse(data.variants);
            productData.variants = Array.isArray(variants) ? variants.map(v => ({
                ...v,
                priceUSD: (v.priceUSD != null && v.priceUSD !== '' && v.priceUSD !== 'null')
                    ? Math.round(Number(v.priceUSD) * 100)
                    : null,
                salePriceUSD: (v.salePriceUSD != null && v.salePriceUSD !== '' && v.salePriceUSD !== 'null')
                    ? Math.round(Number(v.salePriceUSD) * 100)
                    : null
            })) : undefined;
        }
        const hasVariants = data.hasVariants === 'true' || data.hasVariants === true;
        if (data.hasVariants !== undefined) {
            const existingProduct = (await this.productsService.findOne(id));
            if (existingProduct.hasVariants !== hasVariants) {
                const orderCount = existingProduct._count?.orderItems || 0;
                if (orderCount > 0) {
                    throw new common_1.HttpException(`Cannot toggle variants for a product with ${orderCount} existing orders. This would break historical order tracking.`, common_1.HttpStatus.BAD_REQUEST);
                }
            }
            productData.hasVariants = hasVariants;
            if (hasVariants)
                productData.stock = 0;
        }
        const existingForValidation = (await this.productsService.findOne(id));
        const finalHasVariants = productData.hasVariants !== undefined ? productData.hasVariants : existingForValidation.hasVariants;
        const finalVariants = productData.variants || existingForValidation.variants;
        const finalBasePrice = productData.basePriceUSD || existingForValidation.basePriceUSD;
        const finalSalePrice = productData.salePriceUSD !== undefined ? productData.salePriceUSD : existingForValidation.salePriceUSD;
        if (finalSalePrice != null && finalSalePrice > finalBasePrice) {
            throw new common_1.HttpException('Base sale price cannot be higher than base price.', common_1.HttpStatus.BAD_REQUEST);
        }
        if (finalHasVariants) {
            if (!Array.isArray(finalVariants) || finalVariants.length === 0) {
                throw new common_1.HttpException('A product with variants must have at least one variant defined.', common_1.HttpStatus.BAD_REQUEST);
            }
            const combinations = new Set();
            for (const v of finalVariants) {
                const combo = JSON.stringify(v.options || {});
                if (combinations.has(combo)) {
                    throw new common_1.HttpException(`Duplicate variant detected with options: ${combo}`, common_1.HttpStatus.BAD_REQUEST);
                }
                combinations.add(combo);
                const vPrice = v.priceUSD || finalBasePrice;
                if (v.salePriceUSD != null && v.salePriceUSD > vPrice) {
                    throw new common_1.HttpException(`Variant ${v.sku || ''} sale price ($${v.salePriceUSD / 100}) cannot be greater than its price ($${vPrice / 100}).`, common_1.HttpStatus.BAD_REQUEST);
                }
            }
        }
        if (data.isActive !== undefined)
            productData.isActive = data.isActive === 'false' ? false : true;
        if (data.slug)
            productData.slug = data.slug;
        return this.productsService.updateProduct(id, {
            ...productData,
            categoryId: data.categoryId
        });
    }
    updateStock(id, stock) {
        return this.productsService.updateStock(id, stock);
    }
    deleteProduct(id) {
        return this.productsService.remove(id);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-region-code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-region-code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Headers)('x-region-code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOneBySlug", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('admin/list'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('admin/create'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images')),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Patch)('admin/:id'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Patch)('admin/:id/stock'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('stock')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateStock", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "deleteProduct", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        cloudinary_service_1.CloudinaryService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map