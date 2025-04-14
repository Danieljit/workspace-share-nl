import { Metadata } from "next"
import Link from "next/link"
import { SignInForm } from "@/components/auth/signin-form"
import { StaplerIcon } from "@/components/ui/stapler-icon"

// Force dynamic rendering to prevent URL errors during build
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Sign In - WorkSpace Share",
  description: "Sign in to your account",
}

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center space-y-2 text-center">
          <StaplerIcon className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <SignInForm />
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/signup"
            className="hover:text-primary underline underline-offset-4"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
