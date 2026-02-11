
process.env.DATABASE_URL = "mongodb+srv://ayoyemisola_db_user:gVIGlB3cBa1adTbU@cluster0.nv8b7yh.mongodb.net/b2c-ecommerce?retryWrites=true&w=majority";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fs = require('fs');

async function main() {
  const email = 'ayoyemisola@gmail.com';
  let output = `Checking database for user: ${email}\n`;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: true,
    },
  });

  if (!user) {
    output += 'User not found.\n';
  } else {
    output += `User found: ${JSON.stringify(user, null, 2)}\n`;
    output += `User.password: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}\n`;
    if (!user.accounts || user.accounts.length === 0) {
        output += 'WARNING: No accounts found for this user.\n';
    } else {
        user.accounts.forEach(acc => {
            output += `Account Provider: ${acc.providerId}\n`;
            output += `Account ID: ${acc.accountId}\n`;
            output += `Password Hash (first 20 chars): ${acc.password ? acc.password.substring(0, 20) + '...' : 'NULL'}\n`;
        });
    }
  }
  fs.writeFileSync('db-output.txt', output);
  console.log('Output written to db-output.txt');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
