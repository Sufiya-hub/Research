import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/server/db';
import { folders } from '@/server/db/schemas';
import { eq, and } from 'drizzle-orm';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, parentId: parentIdStr } = body;
    const userId = session.user.id;

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
