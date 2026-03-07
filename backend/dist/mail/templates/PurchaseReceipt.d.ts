import * as React from "react";
interface PurchaseReceiptProps {
    orderId: string;
    date: string;
    total: number;
    subtotal: number;
    shippingCost: number;
    discountAmount?: number;
    currency: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    shippingAddress: {
        line1: string;
        city: string;
        state: string;
        country: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        image?: string;
        variantDetails?: string;
        customization?: any;
    }>;
    additionalInfo?: string;
    deliveryTime?: string;
}
export declare const PurchaseReceipt: ({ orderId, date, total, subtotal, shippingCost, discountAmount, currency, firstName, lastName, phone, email, shippingAddress, items, additionalInfo, deliveryTime }: PurchaseReceiptProps) => React.JSX.Element;
export default PurchaseReceipt;
