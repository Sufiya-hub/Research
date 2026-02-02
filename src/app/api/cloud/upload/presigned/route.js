import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { s3Client } from '@/lib/s3';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { fileName, fileType } = body;
    const userId = session.user.id;

    // Generate unique Safe Key
    const uniqueId = crypto.randomUUID();
    const sanitizedName = fileName.replace(/\s+/g, '_');
    const key = `uploads/user_${userId}/${uniqueId}_${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    // Generate Signed URL
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error('Presigned URL Error', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
