
process.env.DATABASE_URL = "mongodb+srv://ayoyemisola_db_user:gVIGlB3cBa1adTbU@cluster0.nv8b7yh.mongodb.net/b2c-ecommerce?retryWrites=true&w=majority";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'ayoyemisola@gmail.com';
  console.log(`Promoting user to admin: ${email}`);

  const user = await prisma.user.update({
    where: { email },
    data: {
      role: 'admin',
    },
  });

  console.log('User updated:', JSON.stringify(user, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
