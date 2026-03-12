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

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const orgKey = searchParams.get('orgKey');

    if (!orgKey) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 },
      );
    }

    const orgRows = await db
      .select()
      .from(organizations)
      .where(eq(organizations.orgKey, orgKey))
      .limit(1);

    if (orgRows.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 },
      );
    }

    const org = orgRows[0];

    const memberRows = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, org.id),
          eq(organizationMembers.userId, userId),
        ),
      )
      .limit(1);

    const joinRequestRows = await db
      .select()
      .from(organizationJoinRequests)
      .where(
        and(
          eq(organizationJoinRequests.organizationId, org.id),
          eq(organizationJoinRequests.userId, userId),
        ),
      )
      .limit(1);

    const membership = memberRows[0] || null;
    const joinRequest = joinRequestRows[0] || null;

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        orgKey: org.orgKey,
        isPublic: org.isPublic,
      },
      membership,
      joinRequest,
    });
  } catch (error) {
    console.error('Error looking up organization:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

