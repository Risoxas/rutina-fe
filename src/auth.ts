import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          console.log(`[Auth] Attempting login for: ${email}`);
          
          const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') || [];
          console.log(`[Auth] Whitelist: ${JSON.stringify(allowedEmails)}`);
          
          if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
            console.log('[Auth] Fail: Email not in whitelist:', email);
            return null;
          }

          const user = await getUser(email);
          if (!user) {
             console.log('[Auth] Fail: User not found');
             return null;
          }
          
          if (!user.password) {
             console.log('[Auth] Fail: No password set');
             return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
             console.log('[Auth] Success: Password matched');
             return user;
          } else {
             console.log('[Auth] Fail: Password mismatch');
             return null;
          }
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        // We need to fetch roles again or store in token
        const user = await getUser(session.user.email);
        if (user) {
            // @ts-expect-error - roles is not in the default session type
            session.user.roles = user.roles;
        } else {
            // User not found in DB (e.g. DB reset), invalidate user in session
            // @ts-expect-error - assigning null to user to force signout/error
            session.user = null;
        }
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    }
  }
});
