import { NextResponse } from "next/server"
import { z } from "zod"
import { sendEmail, contactNotificationEmail } from "@/lib/email"

// Define the contact form schema
const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(1),
  phone: z.string().optional(),
  subject: z.string().min(5),
  message: z.string().min(10),
})

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()

    // Validate the data against our schema
    const validatedData = contactFormSchema.parse(body)

    // Send a notification email to the configured recipient. Falls back to
    // EMAIL_FROM when CONTACT_EMAIL is not set. The email layer itself is
    // fallback-safe (logs to console when RESEND_API_KEY is unset).
    const recipient = process.env.CONTACT_EMAIL ?? process.env.EMAIL_FROM

    if (!recipient) {
      console.error("Contact form: no CONTACT_EMAIL or EMAIL_FROM configured")
      return NextResponse.json(
        { success: false, message: "Contact form is not configured" },
        { status: 500 }
      )
    }

    const { subject, html } = contactNotificationEmail(validatedData)
    const result = await sendEmail({
      to: recipient,
      subject,
      html,
      replyTo: validatedData.email,
    })

    if (result.error) {
      return NextResponse.json(
        { success: false, message: "Failed to send your message. Please try again." },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Contact form submitted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Contact form error:", error)

    // Check if it's a validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
}
