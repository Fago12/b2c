
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'ayoyemisola@gmail.com';
  console.log(`Manually verifying email for: ${email}`);
  
  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: true }
  });

  console.log('✅ User emailVerified set to:', user.emailVerified);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
