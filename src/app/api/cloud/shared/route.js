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
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'with-me';

    let sharedData;

    if (scope === 'by-me') {
      // Files I have shared with others
      sharedData = await db
        .select({
          file: files,
          sharedWith: users.fullName,
          sharedAt: sharedFiles.createdAt,
        })
        .from(sharedFiles)
        .innerJoin(files, eq(sharedFiles.fileId, files.id))
        .innerJoin(users, eq(sharedFiles.sharedWithUserId, users.id))
        .where(eq(sharedFiles.sharedByUserId, userId));
    } else {
      // Default: files shared *with* me
      sharedData = await db
        .select({
          file: files,
          sharedBy: users.fullName,
          sharedAt: sharedFiles.createdAt,
        })
        .from(sharedFiles)
        .innerJoin(files, eq(sharedFiles.fileId, files.id))
        .innerJoin(users, eq(sharedFiles.sharedByUserId, users.id))
        .where(eq(sharedFiles.sharedWithUserId, userId));
    }

    const formattedFiles = sharedData.map(
      ({ file, sharedBy, sharedWith, sharedAt }) => ({
        id: file.id.toString(),
        name: file.fileName,
        type: file.type,
        size: (file.sizeBytes / 1024).toFixed(2) + ' KB',
        s3Key: file.s3Key,
        sharedBy: sharedBy,
        sharedWith: sharedWith,
        sharedAt,
        isShared: true,
        shareDirection: scope === 'by-me' ? 'sent' : 'received',
      }),
    );

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error('Error fetching shared files:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
