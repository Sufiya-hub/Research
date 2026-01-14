import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { folders } from '@/server/db/schemas';
import { eq, and } from 'drizzle-orm';

const getUserId = () => '0386a0e0-fbfd-4fda-ac6d-55a969448e9c';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, parentId: parentIdStr } = body;
    const userId = getUserId();

    let parentId = null;
    if (parentIdStr && parentIdStr !== 'root') {
      parentId = parentIdStr;
    }

    const [newFolder] = await db
      .insert(folders)
      .values({
        name,
        userId,
        parentId,
      })
      .returning();

    return NextResponse.json({
      id: newFolder.id.toString(),
      name: newFolder.name,
      type: 'folder',
      parentId: newFolder.parentId?.toString() || 'root',
    });
  } catch (e) {
    console.error('Create Folder Error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
