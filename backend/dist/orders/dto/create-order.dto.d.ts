declare class OrderItemDto {
    productId: string;
    variantId?: string;
    quantity: number;
    customization?: any;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    email: string;
    isCustomOrder?: boolean;
    customerPhone?: string;
    shippingAddress: any;
    userId?: string;
    currency?: string;
    regionCode?: string;
    couponCode?: string;
    firstName?: string;
    lastName?: string;
}
export {};
