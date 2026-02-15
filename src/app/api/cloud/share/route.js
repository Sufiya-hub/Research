import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users, files, sharedFiles } from '@/server/db/schemas';
import { eq, and } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileId, recipientEmail } = await request.json();

    if (!fileId || !recipientEmail) {
      return NextResponse.json(
        { error: 'File ID and recipient email are required' },
        { status: 400 },
      );
    }

    // 1. Check if recipient exists
    const recipient = await db
      .select()
      .from(users)
      .where(eq(users.email, recipientEmail))
      .limit(1);

    if (recipient.length === 0) {
      return NextResponse.json(
        { error: 'User with this email does not exist' },
        { status: 404 },
      );
    }
    const recipientUser = recipient[0];

    // 2. Prevent self-sharing
    if (recipientUser.id === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot share a file with yourself' },
        { status: 400 },
      );
    }

    // 3. Check if already shared
    const existingShare = await db
      .select()
      .from(sharedFiles)
      .where(
        and(
          eq(sharedFiles.fileId, fileId),
          eq(sharedFiles.sharedWithUserId, recipientUser.id),
        ),
      )
      .limit(1);

    if (existingShare.length > 0) {
      return NextResponse.json(
        { message: 'File is already shared with this user' },
        { status: 200 },
      );
    }

    // 4. Create Share Record
    await db.insert(sharedFiles).values({
      fileId,
      sharedByUserId: session.user.id,
      sharedWithUserId: recipientUser.id,
    });

    return NextResponse.json({ message: 'File shared successfully' });
  } catch (error) {
    console.error('Error sharing file:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
