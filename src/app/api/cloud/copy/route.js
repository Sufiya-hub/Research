import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { folders, files } from '@/server/db/schemas';
import { eq, and, inArray } from 'drizzle-orm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateCopiedS3Key } from '@/lib/utils';
import { S3Client, CopyObjectCommand } from '@aws-sdk/client-s3';
import { copyS3Object } from '@/lib/s3';

const copyFolderRecursive = async (sourceFolderId, targetParentId, userId) => {
  // 1. Load source folder
  const [sourceFolder] = await db
    .select()
    .from(folders)
    .where(and(eq(folders.id, sourceFolderId), eq(folders.userId, userId)));

  if (!sourceFolder) {
    throw new Error('Source folder not found');
  }

  // 2. Create new folder
  const [newFolder] = await db
    .insert(folders)
    .values({
      name: `${sourceFolder.name} (Copy)`,
      userId,
      parentId: targetParentId,
    })
    .returning();

  // 3. Copy files in folder
  const filesInSource = await db
    .select()
    .from(files)
    .where(and(eq(files.parentId, sourceFolderId), eq(files.userId, userId)));

  for (const file of filesInSource) {
    const newS3Key = generateCopiedS3Key(userId, file.s3Key);

    await copyS3Object(file.s3Key, newS3Key);

    await db.insert(files).values({
      fileName: file.fileName,
      userId,
      parentId: newFolder.id,
      type: file.type,
      s3Key: newS3Key,
      sizeBytes: file.sizeBytes,
      storageTier: file.storageTier,
      isEncrypted: file.isEncrypted,
    });
  }

  // 4. Recurse subfolders
  const subfolders = await db
    .select()
    .from(folders)
    .where(
      and(eq(folders.parentId, sourceFolderId), eq(folders.userId, userId))
    );

  for (const subfolder of subfolders) {
    await copyFolderRecursive(subfolder.id, newFolder.id, userId);
  }

  return newFolder.id;
};

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceIds, targetFolderId } = await request.json();
    const userId = session.user.id;

    if (!sourceIds || !sourceIds.length) {
      return NextResponse.json({ success: true });
    }

    const targetId =
      targetFolderId && targetFolderId !== 'root' ? targetFolderId : null;

    // ---- Load folders first ----
    const folderResults = await db
      .select()
      .from(folders)
      .where(and(eq(folders.userId, userId), inArray(folders.id, sourceIds)));

    const folderIds = folderResults.map((f) => f.id);

    // ---- Load files ----
    const fileIds = sourceIds.filter((id) => !folderIds.includes(id));

    const fileResults =
      fileIds.length > 0
        ? await db
            .select()
            .from(files)
            .where(and(eq(files.userId, userId), inArray(files.id, fileIds)))
        : [];

    // ---- COPY FOLDERS ----
    for (const folder of folderResults) {
      await copyFolderRecursive(folder.id, targetId, userId);
    }

    // ---- COPY FILES ----
    for (const file of fileResults) {
      const newS3Key = generateCopiedS3Key(userId, file.s3Key);

      await copyS3Object(file.s3Key, newS3Key);

      const ext = file.fileName.includes('.')
        ? '.' + file.fileName.split('.').pop()
        : '';

      const baseName = file.fileName.replace(ext, '');

      await db.insert(files).values({
        fileName: `${baseName} (Copy)${ext}`,
        userId,
        parentId: targetId,
        type: file.type,
        s3Key: newS3Key,
        sizeBytes: file.sizeBytes,
        storageTier: file.storageTier,
        isEncrypted: file.isEncrypted,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Copy Error:', e);
    return NextResponse.json(
      { error: e.message ?? 'Copy failed' },
      { status: 500 }
    );
  }
}
