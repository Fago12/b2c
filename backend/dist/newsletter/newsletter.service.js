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
var NewsletterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const prisma_service_1 = require("../prisma/prisma.service");
let NewsletterService = NewsletterService_1 = class NewsletterService {
    httpService;
    prisma;
    configService;
    logger = new common_1.Logger(NewsletterService_1.name);
    constructor(httpService, prisma, configService) {
        this.httpService = httpService;
        this.prisma = prisma;
        this.configService = configService;
    }
    async subscribe(email, source = 'footer') {
        const apiKey = this.configService.get('BREVO_API_KEY');
        const listId = Number(this.configService.get('BREVO_LIST_ID_NEWSLETTER') || 1);
        const url = 'https://api.brevo.com/v3/contacts';
        this.logger.log(`Attempting newsletter subscription for ${email} (Source: ${source}, List ID: ${listId})`);
        try {
            await this.prisma.newsletterSubscriber.upsert({
                where: { email },
                update: { isActive: true, source },
                create: { email, source },
            });
        }
        catch (error) {
            this.logger.error(`Failed to save subscriber to DB: ${email}`, error.stack);
        }
        const headers = {
            'api-key': apiKey,
            'Content-Type': 'application/json',
        };
        try {
            try {
                await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, {
                    email,
                    listIds: [listId],
                    updateEnabled: true,
                }, { headers }));
            }
            catch (postError) {
                if (postError?.response?.data?.code !== 'duplicate_parameter') {
                    throw postError;
                }
                this.logger.log(`Contact ${email} already exists, proceeding to explicit list assignment.`);
            }
            try {
                await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${url}/lists/${listId}/contacts/add`, {
                    emails: [email],
                }, { headers }));
            }
            catch (listError) {
                this.logger.warn(`Explicit list assignment failed for ${email} (likely already in list): ${JSON.stringify(listError?.response?.data)}`);
            }
            return {
                success: true,
                message: 'Subscribed successfully',
            };
        }
        catch (error) {
            const responseData = error?.response?.data;
            this.logger.error(`Brevo sync failed for ${email}: ${JSON.stringify(responseData)}`);
            throw new Error('Failed to synchronize with newsletter service');
        }
    }
    async deleteSubscription(email) {
        const apiKey = this.configService.get('BREVO_API_KEY');
        const listId = Number(this.configService.get('BREVO_LIST_ID_NEWSLETTER') || 1);
        const url = `https://api.brevo.com/v3/contacts/lists/${listId}/contacts/remove`;
        this.logger.log(`Deleting newsletter subscription for ${email}`);
        await this.prisma.newsletterSubscriber.delete({
            where: { email },
        });
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, {
                emails: [email],
            }, {
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json',
                },
            }));
        }
        catch (error) {
            const responseData = error?.response?.data;
            this.logger.warn(`Brevo list removal failed for ${email}: ${JSON.stringify(responseData)}`);
        }
        return { success: true };
    }
    async findAll(params) {
        const { page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        const [subscribers, total] = await Promise.all([
            this.prisma.newsletterSubscriber.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.newsletterSubscriber.count(),
        ]);
        return {
            subscribers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getStats() {
        const [total, active] = await Promise.all([
            this.prisma.newsletterSubscriber.count(),
            this.prisma.newsletterSubscriber.count({ where: { isActive: true } }),
        ]);
        return { total, active };
    }
};
exports.NewsletterService = NewsletterService;
exports.NewsletterService = NewsletterService = NewsletterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        prisma_service_1.PrismaService,
        config_1.ConfigService])
], NewsletterService);
//# sourceMappingURL=newsletter.service.js.map