import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@/server/db/schemas';
import { eq } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await db
      .select({ friends: users.friends })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    return NextResponse.json(currentUser[0]?.friends || []);
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
