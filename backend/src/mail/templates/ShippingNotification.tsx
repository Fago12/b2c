import {
    Body,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
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

export const ShippingNotification = ({ orderId, carrier, trackingNumber, trackingUrl, items }: ShippingNotificationProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your order {orderId} has been shipped!</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Order Shipped! 🚚
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Great news! Your order has been shipped and is on its way to you.
                        </Text>
                        <Section className="bg-[#f9f9f9] p-[16px] rounded mb-[20px]">
                            <Text className="m-0 text-black text-[14px]"><strong>Carrier:</strong> {carrier}</Text>
                            <Text className="m-0 text-black text-[14px]"><strong>Tracking Number:</strong> {trackingNumber}</Text>
                        </Section>
                        <Section className="text-center mb-[32px]">
                            <Link
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={trackingUrl}
                            >
                                Track Your Order
                            </Link>
                        </Section>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Heading className="text-black text-[18px] font-semibold mb-[10px]">
                            Items in this shipment
                        </Heading>
                        <Section>
                            {items.map((item, index) => (
                                <Row key={index} className="mb-2">
                                    <Column>
                                        <Text className="m-0 text-black text-[14px]">{item.name} x {item.quantity}</Text>
                                    </Column>
                                </Row>
                            ))}
                        </Section>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-gray-500 text-[12px] text-center">
                            If you have any questions, please reply to this email or visit our website.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ShippingNotification;
