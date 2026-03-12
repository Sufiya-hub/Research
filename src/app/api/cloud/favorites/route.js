import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { files } from '@/server/db/schemas';
import { eq, and } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const favoriteFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isFavorite, true)));

    const formattedItems = favoriteFiles.map((f) => ({
      id: f.id.toString(),
      name: f.fileName,
      type: f.type,
      parentId: f.parentId?.toString() || 'root',
      size: (f.sizeBytes / 1024).toFixed(2) + ' KB',
      s3Key: f.s3Key,
      isFavorite: true,
      lastAccessedAt: f.lastAccessedAt,
      updatedAt: f.updatedAt,
    }));

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error('Error fetching favorite items:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { fileId, isFavorite } = await request.json();

    if (!fileId || typeof isFavorite !== 'boolean') {
      return NextResponse.json(
        { error: 'fileId and isFavorite are required' },
        { status: 400 },
      );
    }

    // Ensure the file belongs to this user
    const result = await db
      .update(files)
      .set({ isFavorite })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'File not found or not owned by user' },
        { status: 404 },
      );
    }

    const f = result[0];

    return NextResponse.json({
      id: f.id.toString(),
      name: f.fileName,
      type: f.type,
      parentId: f.parentId?.toString() || 'root',
      size: (f.sizeBytes / 1024).toFixed(2) + ' KB',
      s3Key: f.s3Key,
      isFavorite: f.isFavorite,
    });
  } catch (error) {
    console.error('Error updating favorite:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 },
    );
  }
}

