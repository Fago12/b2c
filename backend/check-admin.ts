import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@store.com';
  console.log(`Checking for user: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (!user) {
    console.log('❌ User NOT found.');
  } else {
    console.log('✅ User found:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- Password (User table): ${user.password}`);
    console.log(`- Email Verified: ${user.emailVerified}`);
    console.log(`- Accounts: ${user.accounts.length}`);
    user.accounts.forEach((acc, i) => {
        console.log(`  [${i}] Provider: ${acc.providerId}, Password: ${acc.password ? 'Has Password' : 'NULL'}`);
    });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
