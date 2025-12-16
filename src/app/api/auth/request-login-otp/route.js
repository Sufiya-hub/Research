import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { users } from '@/server/db/schemas';
import { sendEmail } from '@/server/email/sendEmail';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 });
    }

    // Find user (prevent enumeration)
    const result = await db.select().from(users).where(eq(users.email, email));

    const user = result[0];

    if (!user) {
      // Always return OK to prevent email enumeration
      return NextResponse.json({ message: 'ok' });
    }

    const code = generateCode();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    // Store OTP
    await db
      .update(users)
      .set({
        loginOtp: code,
        loginOtpExpires: expires,
      })
      .where(eq(users.email, email));

    // Send OTP email
    await sendEmail({
      to: email,
      subject: 'Your login OTP',
      text: `Your OTP is ${code}. It expires in 5 minutes.`,
      html: `<p>Your OTP is <strong>${code}</strong>. It expires in 5 minutes.</p>`,
    });

    return NextResponse.json({ message: 'ok' });
  } catch (error) {
    console.error('request-login-otp error:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
