import NextAuth from 'next-auth';
import { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Configure NextAuth options
export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize() {
        // During testing, always return a valid user
        return {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        };
      },
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      // Add user ID to session
      return {
        ...session,
        user: {
          ...session.user,
          id: '1',
        },
      };
    },
    async jwt({ token }: { token: any }) {
      return token;
    },
  },
};

// Create NextAuth handler
const handler = NextAuth(authOptions);

// Export GET and POST handlers
export { handler as GET, handler as POST };
