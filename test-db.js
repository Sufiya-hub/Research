import { db } from './src/server/db/index.js';
import { files } from './src/server/db/schemas.js';
import { desc } from 'drizzle-orm';

async function run() {
  try {
    const res = await db.select().from(files).orderBy(desc(files.lastAccessedAt)).limit(1);
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
