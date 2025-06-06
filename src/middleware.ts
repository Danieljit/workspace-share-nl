import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  if (!token) {
    if (request.nextUrl.pathname.startsWith("/spaces/list")) {
      return NextResponse.redirect(new URL("/signin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/spaces/list/:path*",
    "/bookings/:path*",
  ],
}
