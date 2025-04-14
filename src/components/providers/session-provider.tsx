"use client"

import React from "react"
import { AuthProvider } from "./auth-provider"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
