import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export interface ProductSearchResult {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
}
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface ChatResponse {
    message: string;
    products?: ProductSearchResult[];
    intent: 'search' | 'info' | 'greeting' | 'unknown';
}
export declare class ChatService {
    private configService;
    private prisma;
    private readonly logger;
    constructor(configService: ConfigService, prisma: PrismaService);
    processMessage(userMessage: string, context?: {
        cartItems?: string[];
        currentPage?: string;
    }): Promise<ChatResponse>;
    private detectIntent;
    private searchProducts;
    private getInfoResponse;
}
