import {
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const copyS3Object = async (sourceKey, destinationKey) => {
  console.log('Copying S3 Object from', sourceKey, 'to', destinationKey);
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      CopySource: `${process.env.AWS_S3_BUCKET}/${sourceKey}`,
      Key: destinationKey,
    })
  );
};

export const getSignedDownloadUrl = async (
  s3Key,
  expiresIn = 60 * 5 // 5 minutes
) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
};
