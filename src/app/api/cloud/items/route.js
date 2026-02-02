import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { folders, files } from '@/server/db/schemas';
import { eq, and, isNull, inArray } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

// Mock User ID - In production use request session
// Mock User ID - In production use request session
// const getUserId = () => '0386a0e0-fbfd-4fda-ac6d-55a969448e9c';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const parentIdAuth = searchParams.get('parentId');
    const userId = session.user.id;

    // Parse parentId: 'root' -> null, or integer
    // Parse parentId: 'root' -> null, or string uuid
    let parentId = null;
    if (parentIdAuth && parentIdAuth !== 'root') {
      parentId = parentIdAuth;
    }

    // Condition for parent
    const parentCondition = (table) =>
      parentId === null ? isNull(table.parentId) : eq(table.parentId, parentId);

    // Fetch Folders
    const userFolders = await db
      .select()
      .from(folders)
      .where(and(eq(folders.userId, userId), parentCondition(folders)));

    // Fetch Files
    const userFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), parentCondition(files)));

    // Format for Frontend
    const formattedItems = [
      ...userFolders.map((f) => ({
        id: f.id.toString(),
        name: f.name,
        type: 'folder',
        parentId: f.parentId?.toString() || 'root',
      })),
      ...userFiles.map((f) => ({
        id: f.id.toString(),
        name: f.fileName,
        type: f.type,
        parentId: f.parentId?.toString() || 'root',
        size: (f.sizeBytes / 1024).toFixed(2) + ' KB',
        s3Key: f.s3Key,
      })),
    ];

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { folderIds, fileIds } = body; // Expect arrays of strings (IDs)
    const userId = getUserId();

    if (folderIds && folderIds.length > 0) {
      await db
        .delete(folders)
        .where(and(eq(folders.userId, userId), inArray(folders.id, folderIds)));
    }

    if (fileIds && fileIds.length > 0) {
      // TODO: Fetch s3Keys first and delete from S3
      await db
        .delete(files)
        .where(and(eq(files.userId, userId), inArray(files.id, fileIds)));
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Delete Error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
