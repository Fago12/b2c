
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function main() {
  console.log("--- Attempting to Create User Manually ---");
  const email = "test-debug-user@gmail.com";
  
  // Cleanup if exists
  await prisma.user.deleteMany({ where: { email } });

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: "Test Debug User",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Better Auth typically writes password hash if enabled, but we simulate basic creation first
      },
    });
    console.log("User created successfully:", user);
  } catch (error) {
    console.error("Prisma Create Failed:", error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
