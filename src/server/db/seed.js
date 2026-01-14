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
  console.log('Seeding user...');
  try {
    const [user] = await db
      .insert(users)
      .values({
        email: 'demo@example.com',
        password: 'hashed_password_placeholder', // In real app, hash this
        fullName: 'Demo User',
      })
      .returning();
    console.log('User created:', user.id);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

main();
