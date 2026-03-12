import 'dotenv/config';
import { db } from './src/server/db/index.js';
import { files } from './src/server/db/schemas.js';
import { eq, desc } from 'drizzle-orm';

async function run() {
  try {
    const userId = 'eae1a529-3970-48a4-9fa3-51544213880e'; // using the user_id from previous query
    const orderByColumn = files.lastAccessedAt;
    const recentFiles = await db
      .select()
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(orderByColumn))
      .limit(50);

    const formattedItems = recentFiles.map((f) => ({
      id: f.id.toString(),
      name: f.fileName,
      type: f.type,
      parentId: f.parentId?.toString() || 'root',
      size: (f.sizeBytes / 1024).toFixed(2) + ' KB',
      s3Key: f.s3Key,
      lastAccessedAt: f.lastAccessedAt,
      updatedAt: f.updatedAt,
    }));

    console.log('Success! Items:', formattedItems.length);
  } catch (err) {
    console.error('Simulation error:', err);
  }
}
run();
