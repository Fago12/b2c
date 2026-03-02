import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getTeam(): Promise<{
        name: string | null;
        id: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        role: string;
        isVerified: boolean;
    }[]>;
    invite(email: string, req: any): Promise<{
        message: string;
    }>;
}
