import { db } from '@/server/db';
import { users } from '@/server/db/schemas';
import { eq, and } from 'drizzle-orm';

export const googleLogin = async (email) => {
  try {
    const result = await db.select().from(users).where(eq(users.email, email));

    if (!result.length) return null;

    return result[0];
  } catch (error) {
    console.error('Google login error:', error);
    return null;
  }
};

export const login = async (email, password) => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.password, password)));

    return result[0] ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const setLoginOtp = async (email, code, expiresAt) => {
  try {
    await db
      .update(users)
      .set({
        loginOtp: code,
        loginOtpExpires: expiresAt,
      })
      .where(eq(users.email, email));

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const verifyLoginOtp = async (email, code) => {
  try {
    const result = await db.select().from(users).where(eq(users.email, email));

    const user = result[0];
    if (!user) return null;

    if (!user.loginOtp || !user.loginOtpExpires) return null;

    if (new Date() > new Date(user.loginOtpExpires)) return null;
    if (user.loginOtp !== code) return null;

    // Clear OTP
    await db
      .update(users)
      .set({
        loginOtp: null,
        loginOtpExpires: null,
      })
      .where(eq(users.email, email));

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      image: user.image,
      position: user.position,
      salary: user.salary,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
