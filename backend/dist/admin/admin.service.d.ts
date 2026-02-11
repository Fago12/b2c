import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private readonly usersService;
    private readonly mailService;
    private readonly prisma;
    private readonly logger;
    constructor(usersService: UsersService, mailService: MailService, prisma: PrismaService);
    getTeam(): Promise<{
        name: string | null;
        id: string;
        email: string;
        image: string | null;
        createdAt: Date;
        role: string;
        isVerified: boolean;
    }[]>;
    inviteAdmin(email: string, inviterName: string): Promise<{
        message: string;
    }>;
}
