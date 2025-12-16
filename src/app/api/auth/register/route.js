import { db } from '@/server/db';
import { users } from '@/server/db/schemas';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { fullName, email, password } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('REGISTER ERROR:', err);

    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }
}
