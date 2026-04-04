import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/server/db';
import {
  files,
  sharedFiles,
  organizationFiles,
  organizationMembers,
} from '@/server/db/schemas';
import { eq, and } from 'drizzle-orm';
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
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';
    const expiresInParam = searchParams.get('expiresIn');
    const expiresIn = expiresInParam ? parseInt(expiresInParam, 10) : 3600;
    const userId = session.user.id;

    // Fetch file if owned by user
    const [file] = await db.select().from(files).where(eq(files.id, fileId));

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check permissions: Owner OR Shared OR part of an organization that has this file
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
        )
        .limit(1);
      if (shared) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      // Check if user belongs to any organization that this file is attached to
      const orgRows = await db
        .select({
          orgFile: organizationFiles,
          member: organizationMembers,
        })
        .from(organizationFiles)
        .innerJoin(
          organizationMembers,
          eq(
            organizationFiles.organizationId,
            organizationMembers.organizationId,
          ),
        )
        .where(
          and(
            eq(organizationFiles.fileId, fileId),
            eq(organizationMembers.userId, userId),
          ),
        )
        .limit(1);

      if (orgRows.length > 0) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update lastAccessedAt
    await db
      .update(files)
      .set({ lastAccessedAt: new Date() })
      .where(eq(files.id, fileId));

    // Generate Presigned GET URL
    const commandParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: file.s3Key,
    };

    if (download) {
      commandParams.ResponseContentDisposition = `attachment; filename="${file.fileName}"`;
    }

    const command = new GetObjectCommand(commandParams);

    // URL valid for specified time, defaults to 1 hour
    const url = await getSignedUrl(s3Client, command, { expiresIn: expiresIn });

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
