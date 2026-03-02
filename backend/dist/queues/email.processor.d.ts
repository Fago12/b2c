import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
export interface EmailJobData {
    to: string;
    subject: string;
    html: string;
    template?: 'welcome' | 'order-confirmation' | 'password-reset' | 'verification' | 'purchase-receipt';
    data?: Record<string, any>;
}
export declare class EmailProcessor extends WorkerHost {
    private configService;
    private mailService;
    private readonly logger;
    private client;
    private defaultFrom;
    constructor(configService: ConfigService, mailService: MailService);
    process(job: Job<EmailJobData>): Promise<void>;
    private renderTemplate;
    onCompleted(job: Job): void;
    onFailed(job: Job, error: Error): void;
}
