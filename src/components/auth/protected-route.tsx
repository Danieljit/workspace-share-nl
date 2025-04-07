"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
