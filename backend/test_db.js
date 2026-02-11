const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Manually load .env since dotenv might not be installed
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error('Failed to load .env', e);
}

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
});

async function main() {
  const dbUrl = process.env.DATABASE_URL || 'UNDEFINED';
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
  console.log(`Testing database connection to: ${maskedUrl}`);
  
  try {
    const count = await prisma.product.count();
    console.log('Successfully connected to database!');
    console.log(`Found ${count} products.`);
    fs.writeFileSync('db_test_output.txt', 'SUCCESS\n');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    fs.writeFileSync('db_test_output.txt', `ERROR: ${error.message}\nSTACK: ${error.stack}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
