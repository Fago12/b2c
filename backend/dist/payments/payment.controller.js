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
var PaymentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const stripe_service_1 = require("./stripe.service");
let PaymentController = PaymentController_1 = class PaymentController {
    stripeService;
    logger = new common_1.Logger(PaymentController_1.name);
    constructor(stripeService) {
        this.stripeService = stripeService;
    }
    async createPaymentIntent(body) {
        return this.stripeService.createPaymentIntent(body.amount, 'usd', body.metadata);
    }
    async updatePaymentIntent(body) {
        this.logger.log(`Received update for PI: ${body.paymentIntentId}`);
        try {
            return await this.stripeService.updatePaymentIntent(body.paymentIntentId, body.metadata);
        }
        catch (e) {
            this.logger.error(`Update Failed: ${e.message}`);
            throw e;
        }
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('create-payment-intent'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Post)('update-payment-intent'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "updatePaymentIntent", null);
exports.PaymentController = PaymentController = PaymentController_1 = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [stripe_service_1.StripeService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map