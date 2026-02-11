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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const reviews_service_1 = require("./reviews.service");
const better_auth_guard_1 = require("../auth/better-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ReviewsController = class ReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    async findAllAdmin(productId, rating, page, limit) {
        try {
            console.log('ReviewsController.findAllAdmin called', { productId, rating, page, limit });
            return await this.reviewsService.findAllAdmin({
                productId,
                rating: rating ? parseInt(rating) : undefined,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
            });
        }
        catch (error) {
            console.error('ReviewsController.findAllAdmin ERROR:', error);
            throw error;
        }
    }
    async getStats() {
        try {
            console.log('ReviewsController.getStats called');
            return await this.reviewsService.getReviewStats();
        }
        catch (error) {
            console.error('ReviewsController.getStats ERROR:', error);
            throw error;
        }
    }
    async deleteReview(id) {
        try {
            return await this.reviewsService.deleteReview(id);
        }
        catch (error) {
            console.error('ReviewsController.deleteReview ERROR:', error);
            throw error;
        }
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Get)('admin/list'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('rating')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.UseGuards)(better_auth_guard_1.BetterAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "deleteReview", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)('reviews'),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map