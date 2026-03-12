import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import {
  organizationMembers,
} from '@/server/db/schemas';
import { and, eq } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { organizationId, memberId, accessLevel } = await request.json();

    if (!organizationId || !memberId || !accessLevel) {
      return NextResponse.json(
        { error: 'organizationId, memberId and accessLevel are required' },
        { status: 400 },
      );
    }

    const adminRows = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
        ),
      )
      .limit(1);

    const adminMember = adminRows[0];

    if (!adminMember || adminMember.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only organization admins can change access levels' },
        { status: 403 },
      );
    }

    await db
      .update(organizationMembers)
      .set({ accessLevel })
      .where(eq(organizationMembers.id, memberId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating member access level:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

