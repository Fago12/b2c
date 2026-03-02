
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('--- RAW MONGODB REPAIR ---');
    
    // Find all documents where rate is not a string
    // BSON type 2 is String. $not: { $type: 2 } or $type: { $ne: 2 } 
    // In MongoDB shell: db.exchange_rate.find({ rate: { $not: { $type: "string" } } })
    
    // We can use findAndModify or just updateMany with a pipeline if supported, 
    // but the easiest is to find them first.
    
    const collectionName = 'exchange_rate';
    
    const results = await prisma.$runCommandRaw({
      find: collectionName,
      filter: { rate: { $not: { $type: "string" } } }
    }) as any;

    if (results.cursor && results.cursor.firstBatch) {
        const poisoned = results.cursor.firstBatch;
        console.log(`Found ${poisoned.length} poisoned records.`);
        
        for (const doc of poisoned) {
            console.log(`Poisoned Doc: ${doc._id.$oid}, Currency: ${doc.currency}, Rate: ${doc.rate} (${typeof doc.rate})`);
            
            // Repair the record: convert rate to string
            await prisma.$runCommandRaw({
                update: collectionName,
                updates: [
                    {
                        q: { _id: doc._id },
                        u: { $set: { rate: String(doc.rate) } }
                    }
                ]
            });
            console.log(`Repaired ${doc.currency}`);
        }
    } else {
        console.log('No poisoned records found via raw query or error in query.');
    }

  } catch (error) {
    console.error('Error during repair:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
