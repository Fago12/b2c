import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send-email";
import { admin } from "better-auth/plugins/admin";

export const adminAuth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "mongodb",
    }),
    session: {
        // @ts-expect-error - Property exists in better-auth 1.x but might be missing in type definitions
        cookiePrefix: "admin-auth",
    },
    emailAndPassword: {
        enabled: true,
        password: {
            hash: async (password: string) => {
                const { hash } = await import("bcryptjs");
                return hash(password, 10);
            },
            verify: async ({ password, hash }) => {
                const { compare } = await import("bcryptjs");
                return compare(password, hash);
            },
        },
        async sendResetPassword({ user, url }) {
            await sendEmail({
                to: user.email,
                subject: "Admin Password Reset",
                html: `<p>Click the link below to reset your admin password:</p><a href="${url}">${url}</a>`,
            });
        },
    },
    advanced: {
        //@ts-ignore - The property is supported in 1.x but may missing in outdated type defs
        cookiePrefix: "admin-auth",
    },
    plugins: [
        admin(),
    ],
    hooks: {
        before: async (ctx) => {
            if (ctx.request) {
                const url = new URL(ctx.request.url);
                if (url.pathname.endsWith("/sign-in/email")) {
                    const body = ctx.body as any;
                    const user = await prisma.user.findUnique({
                        where: { email: body?.email as string }
                    });
                    
                    if (user && !["ADMIN", "SUPER_ADMIN"].includes((user as any).role)) {
                        throw new Error("Access denied: Not an administrator.");
                    }
                }
            }
        }
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: (process.env.BETTER_AUTH_URL || "http://localhost:3000") + "/api/admin-auth",
});
