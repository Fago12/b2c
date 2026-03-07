import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getTeam(): Promise<{
        email: string;
        id: string;
        role: string;
        image: string | null;
        name: string | null;
        createdAt: Date;
        emailVerified: boolean;
        isVerified: boolean;
    }[]>;
    invite(email: string, req: any): Promise<{
        message: string;
    }>;
}
