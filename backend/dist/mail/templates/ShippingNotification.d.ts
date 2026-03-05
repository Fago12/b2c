import * as React from "react";
interface ShippingNotificationProps {
    orderId: string;
    carrier: string;
    trackingNumber: string;
    trackingUrl: string;
    items: Array<{
        name: string;
        quantity: number;
    }>;
}
export declare const ShippingNotification: ({ orderId, carrier, trackingNumber, trackingUrl, items }: ShippingNotificationProps) => React.JSX.Element;
export default ShippingNotification;
