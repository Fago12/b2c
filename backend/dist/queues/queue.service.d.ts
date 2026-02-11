import { Queue } from 'bullmq';
import { EmailJobData } from './email.processor';
export declare class QueueService {
    private emailQueue;
    private readonly logger;
    constructor(emailQueue: Queue);
    sendEmail(data: EmailJobData, priority?: number): Promise<void>;
    sendWelcomeEmail(email: string, name?: string): Promise<void>;
    sendOrderConfirmation(email: string, orderId: string, total: number, name?: string): Promise<void>;
    sendPasswordResetEmail(email: string, resetUrl: string): Promise<void>;
    sendVerificationEmail(email: string, verifyUrl: string): Promise<void>;
    getQueueStats(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
    }>;
}
