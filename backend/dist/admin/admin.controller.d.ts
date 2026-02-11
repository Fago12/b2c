import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getTeam(): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        email: string;
        image: string | null;
        role: string;
        isVerified: boolean;
    }[]>;
    invite(email: string, req: any): Promise<{
        message: string;
    }>;
}
