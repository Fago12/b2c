
import Redis from 'ioredis';

async function main() {
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  try {
    console.log('--- REDIS SESSION AUDIT ---');
    const keys = await redis.keys('cart:*');
    console.log(`Found ${keys.length} cart sessions.`);
    
    for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
            const cart = JSON.parse(data);
            console.log(`Key: ${key}, Items: ${cart.items?.length || 0}, Subtotal: ${cart.displaySubtotal}`);
        }
    }

  } catch (error) {
    console.error('Error during audit:', error);
  } finally {
    await redis.disconnect();
  }
}

main();
