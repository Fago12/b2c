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

interface DeliveryConfirmationProps {
    orderId: string;
    items: Array<{
        name: string;
        quantity: number;
    }>;
}

export const DeliveryConfirmation = ({ orderId, items }: DeliveryConfirmationProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your order {orderId} has been delivered!</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Delivered! 🎉
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Woohoo! Your order has been delivered. We hope you love your new items!
                        </Text>
                        <Section className="bg-[#f9f9f9] p-[16px] rounded mb-[20px]">
                            <Text className="m-0 text-black text-[14px]"><strong>Order ID:</strong> {orderId}</Text>
                        </Section>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Heading className="text-black text-[18px] font-semibold mb-[10px]">
                            Delivered Items
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
                            Thank you for shopping with Woven Kulture!
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default DeliveryConfirmation;
