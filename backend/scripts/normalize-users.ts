import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- User Role & Verification Normalization ---');

  // 1. Convert 'user' role to 'CUSTOMER'
  const roleUpdate = await prisma.user.updateMany({
    where: { role: 'user' },
    data: { role: 'CUSTOMER' }
  });
  console.log(`Updated ${roleUpdate.count} users from role 'user' to 'CUSTOMER'.`);

  // 2. Sync isVerified with emailVerified
  const verifyUpdate = await prisma.user.updateMany({
    where: {
      emailVerified: true,
      isVerified: false
    },
    data: { isVerified: true }
  });
  console.log(`Synchronized verification status for ${verifyUpdate.count} users.`);

  console.log('--- Normalization Complete ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
