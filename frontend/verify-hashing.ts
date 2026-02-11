import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); 
dotenv.config(); // fallback to .env

const prisma = new PrismaClient();

const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "mongodb",
    }),
    emailAndPassword: {
        enabled: true
    }
});

async function main() {
    const password = "admin123";
    console.log(`Hashing password: ${password}`);
    
    // Better Auth's password hashing is internal but we can use the API directly? 
    // Or just create a dummy user to get the hash?
    // Let's create a dummy user and print the password field.
    
    // Cleanup first
    try {
        await prisma.user.delete({ where: { email: "temp-admin-hash@store.com" } });
    } catch {}

    try {
        const user = await auth.api.signUpEmail({
            body: {
                email: "temp-admin-hash@store.com",
                password: password,
                name: "Temp Admin Hash"
            }
        });
        
        if (user) {
            // Read directly from DB
            const dbUser = await prisma.user.findUnique({ 
                where: { email: "temp-admin-hash@store.com" },
                include: { accounts: true }
            });
            console.log("User retrieved from DB:", dbUser ? "YES" : "NO");
            console.log("User Password:", dbUser?.password);
            console.log("Account Password:", dbUser?.accounts[0]?.password);
            
            // Cleanup
            if (dbUser) {
                await prisma.user.delete({ where: { email: "temp-admin-hash@store.com" } });
                await prisma.account.deleteMany({ where: { userId: dbUser.id } }); 
            }
        } else {
            console.log("Failed to create user (returned null/undefined)");
        }
    } catch (e) {
        console.error("Error creating user:", e);
    }
}

main()
.catch(console.error)
.finally(() => prisma.$disconnect());
