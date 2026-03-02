import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send-email";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "auth-debug.log");
function logToFile(msg: string) {
    try {
        fs.appendFileSync(LOG_FILE, `[HOOK][${new Date().toISOString()}] ${msg}\n`);
    } catch(e) {}
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "mongodb",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
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
            console.log(`[BetterAuth] sendResetPassword triggered for ${user.email}`);
            await sendEmail({
                to: user.email,
                subject: "Reset your password",
                html: `<p>Click the link below to reset your password:</p><a href="${url}">${url}</a>`,
            });
        },
    },
    session: {
        //@ts-ignore
        cookiePrefix: "storefront-auth",
    },
    // ... (rest of config)

    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        async sendVerificationEmail({ user, url }) {
            await sendEmail({
                to: user.email,
                subject: "Verify your email address",
                html: `<p>Welcome to Woven Kulture! Please verify your email by clicking the link below:</p><a href="${url}">${url}</a>`,
            });
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    plugins: [
        nextCookies(),
        admin(),
    ],
    hooks: {
        before: async (ctx) => {
            if (ctx.request) {
                const url = new URL(ctx.request.url);
                if (url.pathname.endsWith("/sign-in/email")) {
                    const body = ctx.body as any;
                    const email = (body?.email as string) || "";
                    const user = await prisma.user.findUnique({
                        where: { email }
                    });
                    
                    if (user && ["ADMIN", "SUPER_ADMIN"].includes((user as any).role)) {
                        throw new Error("Administrators must use the admin panel to log in.");
                    }
                }
            }
        }
    },
    advanced: {
        //@ts-ignore - Supported in 1.x
        cookiePrefix: "storefront-auth",
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000", 
    logger: {
        level: "debug",
        log: (level, message, ...args) => {
            console.log(`[BetterAuth] ${level}: ${message}`, ...args);
        },
    },
});
