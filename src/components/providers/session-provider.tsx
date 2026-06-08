"use client"

import React from "react"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { AuthProvider } from "./auth-provider"

/**
 * Wraps the app in the real Auth.js session context and our `useAuth()` adapter.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </NextAuthSessionProvider>
  )
}
