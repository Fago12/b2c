import { compare } from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); 
dotenv.config();

// Hash from previous step (check-admin.ts)
const storedHash = "$2b$10$h8qivYHy3PVsz9p7T/5nZ.YO./oU0r6p9PmALW25nwxd8O5oWrIEu";
const inputPassword = "admin123";

async function main() {
    console.log(`Checking password: ${inputPassword}`);
    console.log(`Against hash: ${storedHash}`);
    
    // Check if hash matches
    const isValid = await compare(inputPassword, storedHash);
    console.log(`Result: ${isValid}`);
    
    if (isValid) {
        console.log("✅ Password match!");
    } else {
        console.log("❌ Password mismatch!");
    }
}

main().catch(console.error);
