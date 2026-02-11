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
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const cart_service_1 = require("./cart.service");
const uuid_1 = require("uuid");
let CartController = class CartController {
    cartService;
    constructor(cartService) {
        this.cartService = cartService;
    }
    getSessionId(req, res) {
        let sessionId = req.cookies?.['guest_session_id'];
        if (!sessionId) {
            sessionId = (0, uuid_1.v4)();
            res.cookie('guest_session_id', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
        }
        return sessionId;
    }
    async getCart(req, res) {
        const sessionId = this.getSessionId(req, res);
        const cart = await this.cartService.getCart(sessionId);
        const totals = this.cartService.getCartTotal(cart);
        return {
            ...cart,
            ...totals,
            sessionId,
        };
    }
    async addItem(req, res, body) {
        const sessionId = this.getSessionId(req, res);
        try {
            const cart = await this.cartService.addItem(sessionId, body.productId, body.quantity || 1);
            const totals = this.cartService.getCartTotal(cart);
            return {
                ...cart,
                ...totals,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateItem(req, res, productId, body) {
        const sessionId = this.getSessionId(req, res);
        try {
            const cart = await this.cartService.updateQuantity(sessionId, productId, body.quantity);
            const totals = this.cartService.getCartTotal(cart);
            return {
                ...cart,
                ...totals,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async removeItem(req, res, productId) {
        const sessionId = this.getSessionId(req, res);
        const cart = await this.cartService.removeItem(sessionId, productId);
        const totals = this.cartService.getCartTotal(cart);
        return {
            ...cart,
            ...totals,
        };
    }
    async clearCart(req, res) {
        const sessionId = this.getSessionId(req, res);
        await this.cartService.clearCart(sessionId);
        return {
            items: [],
            subtotal: 0,
            itemCount: 0,
            updatedAt: new Date(),
        };
    }
    async mergeCart(req, res, body) {
        const guestSessionId = req.cookies?.['guest_session_id'];
        if (!guestSessionId) {
            throw new common_1.HttpException('No guest cart found', common_1.HttpStatus.BAD_REQUEST);
        }
        const cart = await this.cartService.mergeCart(guestSessionId, body.userSessionId);
        const totals = this.cartService.getCartTotal(cart);
        return {
            ...cart,
            ...totals,
        };
    }
};
exports.CartController = CartController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "getCart", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "addItem", null);
__decorate([
    (0, common_1.Patch)('items/:productId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Param)('productId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:productId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "clearCart", null);
__decorate([
    (0, common_1.Post)('merge'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "mergeCart", null);
exports.CartController = CartController = __decorate([
    (0, common_1.Controller)('cart'),
    __metadata("design:paramtypes", [cart_service_1.CartService])
], CartController);
//# sourceMappingURL=cart.controller.js.map