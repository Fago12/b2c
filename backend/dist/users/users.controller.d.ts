import { UsersService } from './users.service';
import { Role } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAllAdmin(search?: string, role?: Role, page?: string, limit?: string): Promise<{
        users: {
            id: string;
            createdAt: Date;
            email: string;
            role: string;
            isVerified: boolean;
            _count: {
                orders: number;
            };
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getStats(): Promise<{
        total: number;
        admins: number;
        customers: number;
        verified: number;
        unverified: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        role: string;
        isVerified: boolean;
        orders: ({
            items: {
                id: string;
                quantity: number;
                price: number;
                productId: string;
                orderId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            userId: string | null;
            email: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            total: number;
            paymentId: string | null;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
        })[];
    } | null>;
    updateRole(id: string, role: Role): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
}
