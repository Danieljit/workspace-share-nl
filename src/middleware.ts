import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

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
