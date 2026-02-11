
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface AdminInviteEmailProps {
    inviteUrl: string;
    inviterName: string;
}

export const AdminInviteEmail = ({ inviteUrl, inviterName }: AdminInviteEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>You have been invited to join Woven Kulture Admin</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Section className="mt-[32px]">
                            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                                Join <strong>Woven Kulture</strong> Admin
                            </Heading>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            <strong>{inviterName}</strong> has invited you to join the Woven Kulture administration team.
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Link
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={inviteUrl}
                            >
                                Accept Invitation
                            </Link>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            or copy and paste this URL into your browser:{" "}
                            <Link href={inviteUrl} className="text-blue-600 no-underline">
                                {inviteUrl}
                            </Link>
                        </Text>
                        <Text className="text-gray-500 text-[12px] mt-4">
                            If you were not expecting this invitation, you can ignore this email.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default AdminInviteEmail;
