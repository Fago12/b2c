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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = ChatService_1 = class ChatService {
    configService;
    prisma;
    logger = new common_1.Logger(ChatService_1.name);
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
    }
    async processMessage(userMessage, context) {
        const intent = this.detectIntent(userMessage);
        switch (intent) {
            case 'greeting':
                return {
                    message: "Hello! 👋 Welcome to our store. I'm here to help you find the perfect products. What are you looking for today?",
                    intent: 'greeting',
                };
            case 'search':
                const products = await this.searchProducts(userMessage);
                if (products.length === 0) {
                    return {
                        message: "I couldn't find any products matching your search. Could you try describing what you're looking for in a different way?",
                        intent: 'search',
                        products: [],
                    };
                }
                return {
                    message: `I found ${products.length} product${products.length > 1 ? 's' : ''} that might interest you:`,
                    products,
                    intent: 'search',
                };
            case 'info':
                return {
                    message: await this.getInfoResponse(userMessage),
                    intent: 'info',
                };
            default:
                return {
                    message: "I'm here to help you find products! Try asking me something like 'Show me traditional attire' or 'I'm looking for a gift under ₦20,000'.",
                    intent: 'unknown',
                };
        }
    }
    detectIntent(message) {
        const lowerMessage = message.toLowerCase().trim();
        const greetingPatterns = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'];
        if (greetingPatterns.some(p => lowerMessage.startsWith(p) || lowerMessage === p)) {
            return 'greeting';
        }
        const searchPatterns = [
            'show me', 'looking for', 'find', 'search', 'want', 'need', 'buy',
            'recommend', 'suggest', 'do you have', 'any', 'where', 'product', 'price'
        ];
        if (searchPatterns.some(p => lowerMessage.includes(p))) {
            return 'search';
        }
        const infoPatterns = ['shipping', 'delivery', 'return', 'refund', 'contact', 'hours', 'help', 'how'];
        if (infoPatterns.some(p => lowerMessage.includes(p))) {
            return 'info';
        }
        if (lowerMessage.length > 3) {
            return 'search';
        }
        return 'unknown';
    }
    async searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        const priceMatch = lowerQuery.match(/under\s+(?:₦|ngn|naira)?\s*(\d+(?:,\d{3})*)/i);
        const maxPrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : undefined;
        const minPriceMatch = lowerQuery.match(/over\s+(?:₦|ngn|naira)?\s*(\d+(?:,\d{3})*)/i);
        const minPrice = minPriceMatch ? parseInt(minPriceMatch[1].replace(/,/g, '')) : undefined;
        const stopWords = ['show', 'me', 'find', 'looking', 'for', 'i', 'want', 'need', 'buy', 'a', 'an', 'the', 'some', 'any', 'do', 'you', 'have', 'under', 'over', 'price', 'ngn', 'naira'];
        const keywords = lowerQuery
            .replace(/[₦,]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word) && !/^\d+$/.test(word));
        const products = await this.prisma.product.findMany({
            where: {
                AND: [
                    ...(maxPrice ? [{ price: { lte: maxPrice } }] : []),
                    ...(minPrice ? [{ price: { gte: minPrice } }] : []),
                    ...(keywords.length > 0 ? [
                        {
                            OR: keywords.flatMap(keyword => [
                                { name: { contains: keyword, mode: 'insensitive' } },
                                { description: { contains: keyword, mode: 'insensitive' } },
                            ]),
                        },
                    ] : []),
                ],
            },
            include: {
                category: true,
            },
            take: 5,
        });
        return products.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            images: p.images,
            category: p.category?.name || 'Uncategorized',
        }));
    }
    async getInfoResponse(query) {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('shipping') || lowerQuery.includes('delivery')) {
            return "📦 We offer nationwide delivery! Standard shipping takes 3-5 business days. Express delivery (1-2 days) is available in Lagos. Free shipping on orders over ₦50,000!";
        }
        if (lowerQuery.includes('return') || lowerQuery.includes('refund')) {
            return "↩️ We have a 14-day return policy. Items must be unworn and in original packaging. Refunds are processed within 5-7 business days after we receive the return.";
        }
        if (lowerQuery.includes('contact') || lowerQuery.includes('support')) {
            return "📞 You can reach us at support@wovenkulture.com or call +234 XXX XXX XXXX. Our customer service hours are Monday-Friday, 9am-6pm WAT.";
        }
        if (lowerQuery.includes('payment')) {
            return "💳 We accept all major credit/debit cards, bank transfers, and Paystack payments. All transactions are securely processed.";
        }
        return "I'd be happy to help! For specific questions about orders, returns, or shipping, please contact our customer service team.";
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map