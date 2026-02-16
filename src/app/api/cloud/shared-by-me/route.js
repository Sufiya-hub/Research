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

    // 🔥 Files shared BY the current user
    const sharedData = await db
      .select({
        file: files,
        sharedWith: users.fullName,
        sharedAt: sharedFiles.createdAt,
      })
      .from(sharedFiles)
      .innerJoin(files, eq(sharedFiles.fileId, files.id))
      .innerJoin(users, eq(sharedFiles.sharedWithUserId, users.id))
      .where(eq(sharedFiles.sharedByUserId, userId));

    const formattedFiles = sharedData.map(({ file, sharedWith, sharedAt }) => ({
      id: file.id.toString(),
      name: file.fileName,
      type: file.type,
      size: (file.sizeBytes / 1024).toFixed(2) + ' KB',
      s3Key: file.s3Key,
      sharedWith: sharedWith, // 👈 Who you shared to
      sharedAt: sharedAt,
      isShared: true,
    }));

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error('Error fetching files shared by user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
