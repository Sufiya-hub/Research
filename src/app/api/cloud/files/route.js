import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { files } from '@/server/db/schemas';

const getUserId = () => '0386a0e0-fbfd-4fda-ac6d-55a969448e9c';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fileName, s3Key, size, type, parentId: parentIdStr } = body;
    const userId = getUserId();

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
