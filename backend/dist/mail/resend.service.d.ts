import { ConfigService } from '@nestjs/config';
export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
}
export declare class ResendService {
    private configService;
    private readonly logger;
    private client;
    private defaultFrom;
    constructor(configService: ConfigService);
    sendEmail(options: SendEmailOptions): Promise<{
        id?: string;
        success: boolean;
    }>;
    sendWelcomeEmail(email: string, name?: string): Promise<void>;
    sendOrderConfirmation(email: string, orderId: string, total: number, items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>, name?: string): Promise<void>;
    sendPasswordReset(email: string, resetUrl: string): Promise<void>;
    sendVerificationEmail(email: string, token: string): Promise<void>;
    private renderWelcomeEmail;
    private renderOrderConfirmation;
    private renderPasswordReset;
    private renderVerificationEmail;
}
