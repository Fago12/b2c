import * as React from "react";
interface PurchaseReceiptProps {
    orderId: string;
    total: number;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        image?: string;
    }>;
}
export declare const PurchaseReceipt: ({ orderId, total, items }: PurchaseReceiptProps) => React.JSX.Element;
export default PurchaseReceipt;
