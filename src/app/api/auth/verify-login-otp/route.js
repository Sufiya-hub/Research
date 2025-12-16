import { db } from '@/server/db';
import { users } from '@/server/db/schemas';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { email, code } = await req.json();

  const result = await db.select().from(users).where(eq(users.email, email));
  const user = result[0];

  if (
    !user ||
    user.loginOtp !== code ||
    !user.loginOtpExpires ||
    new Date() > new Date(user.loginOtpExpires)
  ) {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
  }

  await db
    .update(users)
    .set({ loginOtp: null, loginOtpExpires: null })
    .where(eq(users.email, email));

  return NextResponse.json({ success: true });
}
