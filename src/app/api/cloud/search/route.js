import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { files } from '@/server/db/schemas';
import { eq, and, ilike } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json([]);
    }

    const userId = session.user.id;
    const searchTerm = `%${query}%`;

    // Fetch Files matching the query
    const userFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), ilike(files.fileName, searchTerm)));

    // Format for Frontend
    const formattedFiles = userFiles.map((f) => ({
      id: f.id.toString(),
      name: f.fileName,
      type: f.type,
      parentId: f.parentId?.toString() || 'root',
      size: (f.sizeBytes / 1024).toFixed(2) + ' KB',
      s3Key: f.s3Key,
    }));

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error('Error searching files:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
