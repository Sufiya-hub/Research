import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/server/db';
import { users } from '@/server/db/schemas';
import { eq } from 'drizzle-orm';

export const authOptions = {
  session: {
    strategy: 'jwt',
  },

  providers: [
    // ======================
    // GOOGLE PROVIDER
    // ======================
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // ======================
    // CREDENTIALS (OTP FINAL STEP)
    // ======================
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { type: 'email' },
      },

      /**
       * IMPORTANT:
       * This runs ONLY AFTER OTP is verified.
       * DO NOT check password here.
       */
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email));

        const user = result[0];
        if (!user) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.fullName ?? user.email,
        };
      },
    }),
  ],

  callbacks: {
    // ======================
    // GOOGLE SIGN-IN
    // ======================
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        if (!profile?.email) return false;

        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, profile.email));

        let dbUser = result[0];

        // Auto-create user if not exists
        if (!dbUser) {
          const inserted = await db
            .insert(users)
            .values({
              email: profile.email,
              fullName: profile.name,
            })
            .returning();

          dbUser = inserted[0];
        }

        user.id = dbUser.id.toString();
        user.name = dbUser.fullName ?? dbUser.email;
      }

      return true;
    },

    // ======================
    // JWT
    // ======================
    async jwt({ token, user, account }) {
      // On initial sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      // Ensure token.id persists on subsequent requests
      return token;
    },

    // ======================
    // SESSION
    // ======================
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.name = token.name; // 🔥 ALWAYS DB NAME
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
};
