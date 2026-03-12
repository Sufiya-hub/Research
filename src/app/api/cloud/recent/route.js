import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { files } from '@/server/db/schemas';
import { eq, desc } from 'drizzle-orm';
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
    const type = searchParams.get('type'); // 'accessed' or 'modified'

    let orderByColumn = files.lastAccessedAt;
    if (type === 'modified') {
      orderByColumn = files.updatedAt;
    }

    const recentFiles = await db
      .select()
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(orderByColumn))
      .limit(50);

    const formattedItems = recentFiles.map((f) => ({
      id: f.id.toString(),
      name: f.fileName,
      type: f.type,
      parentId: f.parentId?.toString() || 'root',
      size: (f.sizeBytes / 1024).toFixed(2) + ' KB',
      s3Key: f.s3Key,
      lastAccessedAt: f.lastAccessedAt,
      updatedAt: f.updatedAt,
    }));

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error('Error fetching recent items:', error);
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
