import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import {
  organizations,
  organizationMembers,
} from '@/server/db/schemas';
import { and, eq } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const rows = await db
      .select({
        organization: organizations,
        member: organizationMembers,
      })
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .where(eq(organizationMembers.userId, userId));

    const data = rows.map(({ organization, member }) => ({
      id: organization.id,
      name: organization.name,
      orgKey: organization.orgKey,
      isPublic: organization.isPublic,
      createdAt: organization.createdAt,
      role: member.role,
      accessLevel: member.accessLevel,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error listing organizations:', error);
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
    const { name, orgKey, isPublic = true } = await request.json();

    if (!name || !orgKey) {
      return NextResponse.json(
        { error: 'Name and organization ID are required' },
        { status: 400 },
      );
    }

    // Ensure orgKey is unique
    const existing = await db
      .select()
      .from(organizations)
      .where(eq(organizations.orgKey, orgKey))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Organization ID is already in use' },
        { status: 409 },
      );
    }

    const [org] = await db
      .insert(organizations)
      .values({
        name,
        orgKey,
        isPublic,
        createdByUserId: userId,
      })
      .returning();

    await db.insert(organizationMembers).values({
      organizationId: org.id,
      userId,
      role: 'admin',
      accessLevel: 'share_only',
    });

    return NextResponse.json(
      {
        id: org.id,
        name: org.name,
        orgKey: org.orgKey,
        isPublic: org.isPublic,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

