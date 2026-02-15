import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { files, sharedFiles, users } from '@/server/db/schemas';
import { eq } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch shared files with details and owner info
    const sharedData = await db
      .select({
        file: files,
        sharedBy: users.fullName,
        sharedAt: sharedFiles.createdAt,
      })
      .from(sharedFiles)
      .innerJoin(files, eq(sharedFiles.fileId, files.id))
      .innerJoin(users, eq(sharedFiles.sharedByUserId, users.id))
      .where(eq(sharedFiles.sharedWithUserId, userId));

    const formattedFiles = sharedData.map(({ file, sharedBy, sharedAt }) => ({
      id: file.id.toString(),
      name: file.fileName,
      type: file.type,
      size: (file.sizeBytes / 1024).toFixed(2) + ' KB',
      s3Key: file.s3Key,
      sharedBy: sharedBy, // Add shared info
      sharedAt: sharedAt,
      isShared: true, // Flag for UI
    }));

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error('Error fetching shared files:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
