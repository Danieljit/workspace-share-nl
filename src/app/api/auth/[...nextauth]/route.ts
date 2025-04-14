import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User } from 'next-auth';

/**
 * NextAuth.js v5 configuration
 */
let nextAuthUrl = process.env.NEXTAUTH_URL;

// Try to clean up any markdown or formatting in the URL
if (nextAuthUrl) {
  // Remove markdown link syntax if present
  nextAuthUrl = nextAuthUrl.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove any quotes
  nextAuthUrl = nextAuthUrl.replace(/["']/g, '');
  
  // Override the environment variable with the cleaned version
  process.env.NEXTAUTH_URL = nextAuthUrl;
}

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // This is a simple mock implementation
        // In a real app, you would validate against your database
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        
        if (email && password && password.length >= 6) {
          return {
            id: '1',
            name: 'Demo User',
            email: email,
            image: 'https://randomuser.me/api/portraits/lego/1.jpg',
          } as User;
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub || '';
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
