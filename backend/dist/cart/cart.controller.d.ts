import type { Request, Response } from 'express';
import { CartService } from './cart.service';
export declare class CartController {
    private cartService;
    constructor(cartService: CartService);
    private getSessionId;
    getCart(req: Request, res: Response): Promise<{
        sessionId: string;
        subtotal: number;
        itemCount: number;
        items: import("./cart.service").CartItem[];
        updatedAt: Date;
    }>;
    addItem(req: Request, res: Response, body: {
        productId: string;
        quantity?: number;
    }): Promise<{
        subtotal: number;
        itemCount: number;
        items: import("./cart.service").CartItem[];
        updatedAt: Date;
    }>;
    updateItem(req: Request, res: Response, productId: string, body: {
        quantity: number;
    }): Promise<{
        subtotal: number;
        itemCount: number;
        items: import("./cart.service").CartItem[];
        updatedAt: Date;
    }>;
    removeItem(req: Request, res: Response, productId: string): Promise<{
        subtotal: number;
        itemCount: number;
        items: import("./cart.service").CartItem[];
        updatedAt: Date;
    }>;
    clearCart(req: Request, res: Response): Promise<{
        items: never[];
        subtotal: number;
        itemCount: number;
        updatedAt: Date;
    }>;
    mergeCart(req: Request, res: Response, body: {
        userSessionId: string;
    }): Promise<{
        subtotal: number;
        itemCount: number;
        items: import("./cart.service").CartItem[];
        updatedAt: Date;
    }>;
}
