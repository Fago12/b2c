import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
    firstName: string;
}

export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Welcome to B2C E-commerce!</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Section className="mt-[32px]">
                            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                                Welcome to <strong>B2C E-commerce</strong>
                            </Heading>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello {firstName},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            We're excited to have you on board! You can now explore our vast collection of products and enjoy a seamless shopping experience.
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Link
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href="http://localhost:3000"
                            >
                                Start Shopping
                            </Link>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            or copy and paste this URL into your browser:{" "}
                            <Link href="http://localhost:3000" className="text-blue-600 no-underline">
                                http://localhost:3000
                            </Link>
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default WelcomeEmail;
