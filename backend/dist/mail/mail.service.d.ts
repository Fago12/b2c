export declare class MailService {
    private transporter;
    constructor();
    createTransporter(): Promise<void>;
    sendVerificationEmail(email: string, token: string): Promise<any>;
    sendPasswordResetEmail(email: string, token: string): Promise<any>;
    sendWelcomeEmail(email: string, firstName: string): Promise<any>;
    sendPurchaseReceipt(email: string, orderId: string, total: number, items: any[]): Promise<any>;
    sendAdminInvite(email: string, inviteUrl: string, inviterName: string): Promise<any>;
}
