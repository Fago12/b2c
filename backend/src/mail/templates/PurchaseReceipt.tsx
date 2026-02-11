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

export const PurchaseReceipt = ({ orderId, total, items }: PurchaseReceiptProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your receipt for order {orderId}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Order Confirmation
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Thank you for your purchase! Here is a summary of your order.
                        </Text>
                        <Section>
                            <Text className="text-black text-[14px] leading-[24px] font-bold">
                                Order ID: {orderId}
                            </Text>
                        </Section>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Section>
                            {items.map((item, index) => (
                                <Row key={index} className="mb-4">
                                    <Column>
                                        <Text className="m-0 text-black text-[14px] font-semibold">{item.name}</Text>
                                        <Text className="m-0 text-gray-500 text-[12px]">Qty: {item.quantity}</Text>
                                    </Column>
                                    <Column align="right">
                                        <Text className="m-0 text-black text-[14px]">₦{(item.price * item.quantity).toLocaleString()}</Text>
                                    </Column>
                                </Row>
                            ))}
                        </Section>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Section align="right">
                            <Text className="text-black text-[16px] font-bold leading-[24px]">
                                Total: ₦{total.toLocaleString()}
                            </Text>
                        </Section>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Link
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={`http://localhost:3000/orders/${orderId}`}
                            >
                                View Order
                            </Link>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default PurchaseReceipt;
