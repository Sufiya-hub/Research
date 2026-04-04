import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/server/db';
import { summarizationHistory } from '@/server/db/schemas';
import { eq, desc } from 'drizzle-orm';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const histories = await db
      .select()
      .from(summarizationHistory)
      .where(eq(summarizationHistory.userId, session.user.id))
      .orderBy(desc(summarizationHistory.createdAt));

    return NextResponse.json(histories);
  } catch (error) {
    console.error('Fetch Summarization History Error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, response } = body;

    if (!query || !response) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const [newHistory] = await db
      .insert(summarizationHistory)
      .values({
        userId: session.user.id,
        query,
        response,
      })
      .returning();

    return NextResponse.json(newHistory);
  } catch (error) {
    console.error('Save Summarization History Error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
