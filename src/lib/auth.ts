import NextAuth, { type DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

/**
 * Auth.js v5 configuration — single source of truth for authentication.
 *
 * - Credentials provider verifies email + password against the database (bcrypt).
 * - Google OAuth persists users via the Prisma adapter.
 * - JWT session strategy (required when using the Credentials provider); the
 *   logged-in user's id is exposed on `session.user.id`.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET

// Only register Google when credentials are present so local/dev without OAuth
// keys still boots cleanly (credentials login keeps working).
const providers = []
if (googleClientId && googleClientSecret) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      // Allows linking a Google login to an existing email/password account.
      allowDangerousEmailAccountLinking: true,
    }),
  )
}

providers.push(
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email
      const password = credentials?.password
      if (typeof email !== "string" || typeof password !== "string") {
        return null
      }

      const user = await db.user.findUnique({ where: { email } })
      if (!user?.hashedPassword) {
        return null
      }

      const passwordMatches = await bcrypt.compare(password, user.hashedPassword)
      if (!passwordMatches) {
        return null
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      }
    },
  }),
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  providers,
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
})
