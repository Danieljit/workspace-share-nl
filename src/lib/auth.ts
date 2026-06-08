import NextAuth, { type DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { authConfig } from "@/auth.config"

/**
 * Full (Node-runtime) Auth.js v5 configuration — single source of truth.
 *
 * Extends the edge-safe `authConfig` with the Prisma adapter and the
 * Credentials provider (both of which need Node APIs / the database). The
 * edge-safe config is used directly by `src/middleware.ts`.
 *
 * - Credentials provider verifies email + password against the database (bcrypt).
 * - Google OAuth (from authConfig) persists users via the Prisma adapter.
 * - JWT session strategy; the logged-in user's id is exposed on `session.user.id`.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    ...authConfig.providers,
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
  ],
})
