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
var IdempotencyInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const redis_service_1 = require("../../redis/redis.service");
const idempotent_decorator_1 = require("../decorators/idempotent.decorator");
let IdempotencyInterceptor = IdempotencyInterceptor_1 = class IdempotencyInterceptor {
    redisService;
    reflector;
    logger = new common_1.Logger(IdempotencyInterceptor_1.name);
    constructor(redisService, reflector) {
        this.redisService = redisService;
        this.reflector = reflector;
    }
    async intercept(context, next) {
        const isIdempotent = this.reflector.get(idempotent_decorator_1.IDEMPOTENT_KEY, context.getHandler());
        if (!isIdempotent) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
            return next.handle();
        }
        const idempotencyKey = request.headers['idempotency-key'];
        if (!idempotencyKey) {
            throw new common_1.HttpException('Idempotency-Key header is required for this request', common_1.HttpStatus.BAD_REQUEST);
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(idempotencyKey)) {
            throw new common_1.HttpException('Idempotency-Key must be a valid UUID v4', common_1.HttpStatus.BAD_REQUEST);
        }
        const existingData = await this.redisService.getIdempotencyKey(idempotencyKey);
        if (existingData) {
            const parsed = JSON.parse(existingData);
            if (parsed.status === 'processing') {
                throw new common_1.HttpException('Request is already being processed. Please retry later.', common_1.HttpStatus.CONFLICT);
            }
            if (parsed.status === 'complete' && parsed.response) {
                this.logger.log(`Returning cached response for idempotency key: ${idempotencyKey}`);
                response.status(parsed.response.statusCode);
                return (0, rxjs_1.of)(parsed.response.body);
            }
        }
        const acquired = await this.redisService.setIdempotencyProcessing(idempotencyKey);
        if (!acquired) {
            throw new common_1.HttpException('Request is already being processed. Please retry later.', common_1.HttpStatus.CONFLICT);
        }
        return next.handle().pipe((0, operators_1.tap)(async (data) => {
            await this.redisService.markIdempotencyComplete(idempotencyKey, {
                statusCode: response.statusCode,
                body: data,
            });
            this.logger.log(`Cached response for idempotency key: ${idempotencyKey}`);
        }), (0, operators_1.catchError)(async (error) => {
            if (error instanceof common_1.HttpException) {
                const status = error.getStatus();
                if (status >= 400 && status < 500) {
                    this.logger.log(`Not caching client error for idempotency key: ${idempotencyKey}`);
                }
            }
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
};
exports.IdempotencyInterceptor = IdempotencyInterceptor;
exports.IdempotencyInterceptor = IdempotencyInterceptor = IdempotencyInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        core_1.Reflector])
], IdempotencyInterceptor);
//# sourceMappingURL=idempotency.interceptor.js.map