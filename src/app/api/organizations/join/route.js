import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import {
  organizations,
  organizationMembers,
  organizationJoinRequests,
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
    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 },
      );
    }

    const orgRows = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (orgRows.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 },
      );
    }

    const org = orgRows[0];

    const existingMember = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, org.id),
          eq(organizationMembers.userId, userId),
        ),
      )
      .limit(1);

    if (existingMember.length > 0) {
      return NextResponse.json(
        { status: 'already_member', organizationId: org.id },
        { status: 200 },
      );
    }

    if (org.isPublic) {
      await db.insert(organizationMembers).values({
        organizationId: org.id,
        userId,
        role: 'member',
        accessLevel: 'view_only',
      });

      return NextResponse.json(
        { status: 'joined', organizationId: org.id },
        { status: 200 },
      );
    }

    // Private organization: create or reuse join request
    const existingRequest = await db
      .select()
      .from(organizationJoinRequests)
      .where(
        and(
          eq(organizationJoinRequests.organizationId, org.id),
          eq(organizationJoinRequests.userId, userId),
        ),
      )
      .limit(1);

    if (existingRequest.length === 0) {
      await db.insert(organizationJoinRequests).values({
        organizationId: org.id,
        userId,
        status: 'pending',
      });
    }

    return NextResponse.json(
      { status: 'requested', organizationId: org.id },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error joining organization:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

