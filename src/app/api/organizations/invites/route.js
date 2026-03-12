import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import {
  organizations,
  organizationMembers,
  organizationInvites,
} from '@/server/db/schemas';
import { and, eq } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;

    const rows = await db
      .select({
        invite: organizationInvites,
        organization: organizations,
      })
      .from(organizationInvites)
      .innerJoin(
        organizations,
        eq(organizationInvites.organizationId, organizations.id),
      )
      .where(
        and(
          eq(organizationInvites.email, email),
          eq(organizationInvites.status, 'pending'),
        ),
      );

    const data = rows.map(({ invite, organization }) => ({
      id: invite.id,
      organizationId: organization.id,
      organizationName: organization.name,
      orgKey: organization.orgKey,
      accessLevel: invite.accessLevel,
      status: invite.status,
      createdAt: invite.createdAt,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error listing organization invites:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
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
    const { organizationId, email, accessLevel = 'view_only' } =
      await request.json();

    if (!organizationId || !email) {
      return NextResponse.json(
        { error: 'organizationId and email are required' },
        { status: 400 },
      );
    }

    // Ensure requester is admin of the organization
    const member = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
        ),
      )
      .limit(1);

    if (member.length === 0 || member[0].role !== 'admin') {
      return NextResponse.json(
        { error: 'Only organization admins can send invites' },
        { status: 403 },
      );
    }

    await db.insert(organizationInvites).values({
      organizationId,
      email,
      invitedByUserId: userId,
      accessLevel,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating organization invite:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

