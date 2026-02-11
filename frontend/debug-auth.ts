
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('--- Debug Auth Request ---');
  const email = 'admin@store.com';
  const password = 'admin123';

  console.log(`Fetching user: ${email}`);
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log('✅ User found:');
  console.log(`- ID: ${user.id}`);
  console.log(`- Role: ${user.role}`);
  console.log(`- Email Verified: ${user.emailVerified}`);
  console.log(`- Password Hash: ${user.password}`);

  if (!user.password) {
    console.log('❌ User has no password');
    return;
  }

  console.log(`Verifying password: "${password}"`);
  const isValid = await compare(password, user.password);
  console.log(`- Password Valid: ${isValid}`);
    
  if (isValid) {
      console.log('✅ AUTHENTICATION SHOULD SUCCEED');
  } else {
      console.log('❌ AUTHENTICATION FAILED (Hash Mismatch)');
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
