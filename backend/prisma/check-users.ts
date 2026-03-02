import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- ALL USERS ---');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
    }
  });
  users.forEach(u => console.log(`User: ${u.email} | Role: ${u.role} | ID: ${u.id}`));

  console.log('\n--- ACTIVE SESSIONS ---');
  const sessions = await prisma.session.findMany({
    include: {
      user: {
        select: {
          email: true,
          role: true,
        }
      }
    }
  });
  
  sessions.forEach(s => {
    console.log(`Token Prefix: ${s.token.substring(0, 8)}... | User: ${s.user.email} | Role: ${s.user.role} | Expires: ${s.expiresAt}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
