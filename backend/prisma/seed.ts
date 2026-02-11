import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@store.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123'; // Default for dev, override in .env
  const hashedPassword = await bcrypt.hash(password, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email },
    update: {
        role: 'SUPER_ADMIN', 
        isVerified: true,
        emailVerified: true,
        password: hashedPassword, // Force update password ensuring known state
    },
    create: {
      email,
      name: 'Super Admin',
      password: hashedPassword, // Legacy field if needed
      role: 'SUPER_ADMIN',
      isVerified: true,
      emailVerified: true,
    },
  });

  // Create associated Account for Better Auth (credential provider)
  const account = await prisma.account.findFirst({
      where: {
          userId: superAdmin.id,
          providerId: "credential",
      }
  });

  if (!account) {
      await prisma.account.create({
          data: {
              userId: superAdmin.id,
              providerId: "credential",
              accountId: email, // Use email as accountId for credential provider
              password: hashedPassword,
              accessToken: "mock-access-token", // Optional but good for valid object
          }
      });
      console.log("Created credential account for admin");
  } else {
      await prisma.account.update({
          where: { id: account.id },
          data: {
              password: hashedPassword,
          }
      });
      console.log("Updated credential account password for admin");
  }

  console.log({ superAdmin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
