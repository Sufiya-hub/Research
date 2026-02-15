import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/server/db';
import { files, sharedFiles } from '@/server/db/schemas';
import { eq, and, or } from 'drizzle-orm';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '@/lib/s3';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: fileId } = await params;
    const userId = session.user.id;

    // Fetch file if owned by user
    const [file] = await db.select().from(files).where(eq(files.id, fileId));

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check permissions: Owner OR Shared
    let hasAccess = file.userId === userId;

    if (!hasAccess) {
      const [shared] = await db
        .select()
        .from(sharedFiles)
        .where(
          and(
            eq(sharedFiles.fileId, fileId),
            eq(sharedFiles.sharedWithUserId, userId),
          ),
        );
      if (shared) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate Presigned GET URL
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: file.s3Key,
    });

    // URL valid for 1 hour
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({
      url,
      name: file.fileName,
      type: file.type,
      mimeType: file.type, // TODO: Store actual mime type if available, otherwise extension is used
    });
  } catch (error) {
    console.error('Preview Error', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
