import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/server/db';
import { files } from '@/server/db/schemas';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, s3Key, size, type, parentId: parentIdStr } = body;
    const userId = session.user.id;

    let parentId = null;
    if (parentIdStr && parentIdStr !== 'root') {
      parentId = parentIdStr;
    }

    const [newFile] = await db
      .insert(files)
      .values({
        fileName,
        s3Key,
        sizeBytes: size, // Frontend sends bytes
        type,
        userId,
        parentId,
      })
      .returning();

    return NextResponse.json({
      id: newFile.id.toString(),
      name: newFile.fileName,
      type: newFile.type,
      parentId: newFile.parentId?.toString() || 'root',
      size: (newFile.sizeBytes / 1024).toFixed(2) + ' KB',
      s3Key: newFile.s3Key,
    });
  } catch (e) {
    console.error('Save File Error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
