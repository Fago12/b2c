const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.session.findMany({ take: 5 });
  console.log('--- Sample Sessions ---');
  sessions.forEach(s => {
    console.log(`Token: ${s.token}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
