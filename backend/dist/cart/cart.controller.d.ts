import type { Request, Response } from 'express';
import { CartService } from './cart.service';
export declare class CartController {
    private cartService;
    constructor(cartService: CartService);
    private getSessionId;
    private getRegionCode;
    getCart(req: Request, res: Response): Promise<{
        sessionId: string;
        itemCount: number;
        shippingCost: number;
        total: number;
        currency: string;
        chargeTotal: number;
        chargeCurrency: string;
        items: import("./cart.service").CartItem[];
        regionCode: string;
        displayCurrency: string;
        displaySubtotal: number;
        displayTotal: number;
        exchangeRateUsed: string;
        couponCode?: string;
        discountAmount?: number;
        updatedAt: Date;
    }>;
    addItem(req: Request, res: Response, body: {
        productId: string;
        quantity?: number;
        customization?: any;
        variantId?: string;
    }): Promise<{
        itemCount: number;
        shippingCost: number;
        total: number;
        currency: string;
        chargeTotal: number;
        chargeCurrency: string;
        items: import("./cart.service").CartItem[];
        regionCode: string;
        displayCurrency: string;
        displaySubtotal: number;
        displayTotal: number;
        exchangeRateUsed: string;
        couponCode?: string;
        discountAmount?: number;
        updatedAt: Date;
    }>;
    updateItem(req: Request, res: Response, productId: string, body: {
        quantity: number;
        variantId?: string;
    }): Promise<{
        itemCount: number;
        shippingCost: number;
        total: number;
        currency: string;
        chargeTotal: number;
        chargeCurrency: string;
        items: import("./cart.service").CartItem[];
        regionCode: string;
        displayCurrency: string;
        displaySubtotal: number;
        displayTotal: number;
        exchangeRateUsed: string;
        couponCode?: string;
        discountAmount?: number;
        updatedAt: Date;
    }>;
    removeItem(req: Request, res: Response, productId: string): Promise<{
        itemCount: number;
        shippingCost: number;
        total: number;
        currency: string;
        chargeTotal: number;
        chargeCurrency: string;
        items: import("./cart.service").CartItem[];
        regionCode: string;
        displayCurrency: string;
        displaySubtotal: number;
        displayTotal: number;
        exchangeRateUsed: string;
        couponCode?: string;
        discountAmount?: number;
        updatedAt: Date;
    }>;
    clearCart(req: Request, res: Response): Promise<{
        items: never[];
        subtotal: number;
        itemCount: number;
        shippingCost: number;
        total: number;
        updatedAt: Date;
    }>;
    mergeCart(req: Request, res: Response, body: {
        userSessionId: string;
    }): Promise<{
        itemCount: number;
        shippingCost: number;
        total: number;
        currency: string;
        chargeTotal: number;
        chargeCurrency: string;
        items: import("./cart.service").CartItem[];
        regionCode: string;
        displayCurrency: string;
        displaySubtotal: number;
        displayTotal: number;
        exchangeRateUsed: string;
        couponCode?: string;
        discountAmount?: number;
        updatedAt: Date;
    }>;
    applyCoupon(req: Request, res: Response, body: {
        code: string;
    }): Promise<{
        itemCount: number;
        shippingCost: number;
        total: number;
        currency: string;
        chargeTotal: number;
        chargeCurrency: string;
        items: import("./cart.service").CartItem[];
        regionCode: string;
        displayCurrency: string;
        displaySubtotal: number;
        displayTotal: number;
        exchangeRateUsed: string;
        couponCode?: string;
        discountAmount?: number;
        updatedAt: Date;
    }>;
    removeCoupon(req: Request, res: Response): Promise<{
        itemCount: number;
        shippingCost: number;
        total: number;
        currency: string;
        chargeTotal: number;
        chargeCurrency: string;
        items: import("./cart.service").CartItem[];
        regionCode: string;
        displayCurrency: string;
        displaySubtotal: number;
        displayTotal: number;
        exchangeRateUsed: string;
        couponCode?: string;
        discountAmount?: number;
        updatedAt: Date;
    }>;
    updateRegion(req: Request, res: Response, body: {
        regionCode: string;
    }): Promise<{
        itemCount: number;
        shippingCost: number;
        total: number;
        currency: string;
        chargeTotal: number;
        chargeCurrency: string;
        items: import("./cart.service").CartItem[];
        regionCode: string;
        displayCurrency: string;
        displaySubtotal: number;
        displayTotal: number;
        exchangeRateUsed: string;
        couponCode?: string;
        discountAmount?: number;
        updatedAt: Date;
    }>;
}
