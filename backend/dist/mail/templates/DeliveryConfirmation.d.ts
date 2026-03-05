import * as React from "react";
interface DeliveryConfirmationProps {
    orderId: string;
    items: Array<{
        name: string;
        quantity: number;
    }>;
}
export declare const DeliveryConfirmation: ({ orderId, items }: DeliveryConfirmationProps) => React.JSX.Element;
export default DeliveryConfirmation;
