import { PrismaAdapter } from "@auth/prisma-adapter"
import type { DefaultSession, NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

// Helper function to sanitize URLs
function sanitizeUrl(url: string | undefined): string {
  if (!url) return 'http://localhost:3000';
  
  // Remove markdown link syntax if present
  let cleanUrl = url.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove any quotes
  cleanUrl = cleanUrl.replace(/["']/g, '');
  
  // Ensure it's a valid URL
  try {
    new URL(cleanUrl);
    return cleanUrl;
  } catch (e) {
    console.error('Invalid URL:', cleanUrl);
    return 'http://localhost:3000';
  }
}

// Clean the NEXTAUTH_URL environment variable
if (process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = sanitizeUrl(process.env.NEXTAUTH_URL);
}

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize() {
        // During testing, always return a valid user
        return { id: "1", name: "Test User", email: "test@example.com" }
      }
    })
  ],
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: "1"
        }
      }
    }
  }
}

// Simple mock auth function for demonstration purposes
export const auth = () => {
  return Promise.resolve({
    user: { id: "1", name: "Test User", email: "test@example.com" }
  })
}
