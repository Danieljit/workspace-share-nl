import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/auth.config"

/**
 * Edge-safe auth instance built from the base config (no Prisma adapter / no
 * Credentials provider — those use Node APIs and can't run on the Edge). The
 * JWT session lets middleware verify the logged-in user without a DB call.
 */
const { auth } = NextAuth(authConfig)

/**
 * Protects authenticated areas of the app. Unauthenticated users hitting a
 * protected route are redirected to /signin with a callbackUrl so they return
 * to where they were headed after logging in.
 */
export default auth((request) => {
  const isLoggedIn = !!request.auth
  const { pathname, search } = request.nextUrl

  if (!isLoggedIn) {
    const signInUrl = new URL("/signin", request.nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/spaces/list/:path*",
    "/people/:path*",
    "/bookings/:path*",
  ],
}
