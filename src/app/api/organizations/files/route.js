import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import {
  organizationFiles,
  organizationMembers,
} from '@/server/db/schemas';
import { and, eq } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { organizationId, fileId } = await request.json();

    if (!organizationId || !fileId) {
      return NextResponse.json(
        { error: 'organizationId and fileId are required' },
        { status: 400 },
      );
    }

    const memberRows = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
        ),
      )
      .limit(1);

    const member = memberRows[0];

    if (!member) {
      return NextResponse.json(
        { error: 'You are not a member of this organization' },
        { status: 403 },
      );
    }

    if (member.accessLevel === 'view_only') {
      return NextResponse.json(
        { error: 'Your access level only allows viewing, not sharing' },
        { status: 403 },
      );
    }

    // Avoid duplicates: one record per file/org pair
    const existing = await db
      .select()
      .from(organizationFiles)
      .where(
        and(
          eq(organizationFiles.organizationId, organizationId),
          eq(organizationFiles.fileId, fileId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(organizationFiles).values({
        organizationId,
        fileId,
        addedByUserId: userId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding file to organization:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

