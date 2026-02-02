import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { folders, files } from '@/server/db/schemas';
import { eq, and, inArray } from 'drizzle-orm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// const getUserId = () => '0386a0e0-fbfd-4fda-ac6d-55a969448e9c';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    // ids: array of strings. targetFolderId: string ('root' or id)
    const { ids, targetFolderId: targetIdStr } = body;
    const userId = session.user.id;

    let targetId = null;
    if (targetIdStr && targetIdStr !== 'root') {
      targetId = targetIdStr;
    }

    const { items } = body;

    if (!items || !items.length) {
      return NextResponse.json({ success: true }); // No op
    }

    const folderIds = items.filter((i) => i.type === 'folder').map((i) => i.id);
    const fileIds = items.filter((i) => i.type !== 'folder').map((i) => i.id);

    if (folderIds.length) {
      await db
        .update(folders)
        .set({ parentId: targetId })
        .where(and(eq(folders.userId, userId), inArray(folders.id, folderIds)));
    }

    if (fileIds.length) {
      await db
        .update(files)
        .set({ parentId: targetId })
        .where(and(eq(files.userId, userId), inArray(files.id, fileIds)));
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Move Error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
