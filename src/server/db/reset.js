import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  },
});

async function main() {
  console.log('Dropping tables...');
  try {
    // Order matters due to FKs
    await db.execute(sql`DROP TABLE IF EXISTS file_embeddings CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS files CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS folders CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE;`);
    console.log('Tables dropped.');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

main();
