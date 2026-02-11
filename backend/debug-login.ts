
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'ayoyemisola@gmail.com';
  console.log(`--- Debugging Login for: ${email} ---`);
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true }
  });

  if (!user) {
    console.log('❌ User NOT found!');
    return;
  }

  console.log('User ID:', user.id);
  console.log('Email Verified:', user.emailVerified);
  console.log('Banned:', user.banned);
  console.log('Legacy verification (isVerified):', user.isVerified);
  
  const credentialAccount = user.accounts.find(a => a.providerId === 'credential');
  if (credentialAccount) {
      console.log('✅ Credential Account found.');
      console.log('   Password Hash:', credentialAccount.password?.substring(0, 10) + '...');
  } else {
      console.log('❌ NO Credential Account found!');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
