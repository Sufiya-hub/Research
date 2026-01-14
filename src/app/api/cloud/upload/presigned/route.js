import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock User
const getUserId = () => '0386a0e0-fbfd-4fda-ac6d-55a969448e9c';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { fileName, fileType } = body;
    const userId = getUserId();

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
