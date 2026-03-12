import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import {
  organizations,
  organizationMembers,
  organizationFiles,
  users,
  files,
} from '@/server/db/schemas';
import { and, eq } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function GET(_request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: orgKey } = await context.params;

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

    const orgId = org.id;

    const membershipRows = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.userId, userId),
        ),
      )
      .limit(1);

    const membership = membershipRows[0];

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this organization' },
        { status: 403 },
      );
    }

    const memberRows = await db
      .select({
        member: organizationMembers,
        user: users,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, orgId));

    const members = memberRows.map(({ member, user }) => ({
      id: member.id,
      userId: member.userId,
      name: user.fullName || user.email,
      email: user.email,
      role: member.role,
      accessLevel: member.accessLevel,
      createdAt: member.createdAt,
      isCurrentUser: member.userId === userId,
    }));

    const fileRows = await db
      .select({
        orgFile: organizationFiles,
        file: files,
        owner: users,
      })
      .from(organizationFiles)
      .innerJoin(files, eq(organizationFiles.fileId, files.id))
      .innerJoin(users, eq(files.userId, users.id))
      .where(eq(organizationFiles.organizationId, orgId));

    const orgFilesData = fileRows.map(({ orgFile, file, owner }) => ({
    id: file.id, // align with CloudManager's file.id
    orgFileId: orgFile.id,
      name: file.fileName,
      type: file.type,
      size: (file.sizeBytes / 1024).toFixed(2) + ' KB',
      ownerName: owner.fullName || owner.email,
      addedAt: orgFile.createdAt,
    }));

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        orgKey: org.orgKey,
        isPublic: org.isPublic,
      },
      membership: {
        role: membership.role,
        accessLevel: membership.accessLevel,
      },
      members,
      files: orgFilesData,
    });
  } catch (error) {
    console.error('Error fetching organization detail:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

