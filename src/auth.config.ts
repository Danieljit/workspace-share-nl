import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

/**
 * Edge-safe base auth config. Contains ONLY things that can run in the Edge
 * runtime (used by middleware): session strategy, pages, callbacks, and the
 * Google provider. The Prisma adapter and the Credentials provider (which use
 * Node APIs / the database) are added separately in `src/lib/auth.ts`.
 */

const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  providers:
    googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            // Intentionally NOT auto-linking by email: allowDangerousEmailAccountLinking
            // is left at its secure default (false) to avoid an account-takeover vector
            // where signing in with Google would merge into an unverified credentials
            // account sharing the same email. Implement an explicit, verified linking
            // flow if account linking is needed.
          }),
        ]
      : [],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
} satisfies NextAuthConfig
