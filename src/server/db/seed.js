import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users } from './schemas.js';

const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  },
});

async function main() {
  console.log('Seeding fixed user...');
  try {
    // Use the ID that is hardcoded in the API routes
    const HARDCODED_ID = '0386a0e0-fbfd-4fda-ac6d-55a969448e9c';

    const [user] = await db
      .insert(users)
      .values({
        id: HARDCODED_ID,
        email: 'demo@example.com',
        password: 'hashed_password_placeholder',
        fullName: 'Demo User',
      })
      .onConflictDoNothing()
      .returning();

    if (user) {
      console.log('User created:', user.id);
    } else {
      console.log('User already exists (or conflict ignored).');
    }
  } catch (e) {
    console.error('Seed error:', e);
  }
  process.exit(0);
}

main();
