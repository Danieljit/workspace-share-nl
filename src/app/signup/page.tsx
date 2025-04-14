import { Metadata } from "next"
import Link from "next/link"
import { SignUpForm } from "@/components/auth/signup-form"
import { StaplerIcon } from "@/components/ui/stapler-icon"

// Force dynamic rendering to prevent URL errors during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: "Sign Up - WorkSpace Share",
  description: "Create a new account",
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center space-y-2 text-center">
          <StaplerIcon className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>
        <SignUpForm />
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/signin"
            className="hover:text-primary underline underline-offset-4"
          >
            Already have an account? Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
