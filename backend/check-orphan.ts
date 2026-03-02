import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orphanedUserId = 'cmlgfxdc30000s0noefwcdvo0';
  const user = await prisma.user.findUnique({ where: { id: orphanedUserId } });
  console.log(`User with ID ${orphanedUserId}: ${user ? 'EXISTS (' + user.email + ')' : 'NOT FOUND'}`);
  
  const allUsersWithEmail = await prisma.user.findMany({ where: { email: 'ayoyemisola@gmail.com' } });
  console.log(`All users with email ayoyemisola@gmail.com: ${JSON.stringify(allUsersWithEmail)}`);
}

main().finally(() => prisma.$disconnect());
