import { Resend } from "resend"

/**
 * Transactional email layer (Resend).
 *
 * Fallback-safe by design: if RESEND_API_KEY is not configured, emails are
 * logged to the server console instead of throwing, so local/dev and
 * not-yet-configured environments keep working. Wire real delivery by setting
 * RESEND_API_KEY and EMAIL_FROM (see .env.example).
 */

const resendApiKey = process.env.RESEND_API_KEY
const fromAddress = process.env.EMAIL_FROM ?? "WorkspaceShare <onboarding@resend.dev>"

const resend = resendApiKey ? new Resend(resendApiKey) : null

export interface EmailMessage {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export interface SendEmailResult {
  delivered: boolean
  skipped?: boolean
  error?: string
}

export async function sendEmail(message: EmailMessage): Promise<SendEmailResult> {
  if (!resend) {
    // TODO: set RESEND_API_KEY + EMAIL_FROM to enable real delivery.
    console.log(
      `[email:dev] (not sent — RESEND_API_KEY missing) to=${message.to} subject="${message.subject}"`,
    )
    return { delivered: false, skipped: true }
  }

  try {
    await resend.emails.send({
      from: fromAddress,
      to: message.to,
      subject: message.subject,
      html: message.html,
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
    })
    return { delivered: true }
  } catch (error) {
    console.error("[email] delivery failed:", error)
    return {
      delivered: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    }
  }
}

// ---------------------------------------------------------------------------
// Template builders — return { subject, html }. Callers add the recipient.
// ---------------------------------------------------------------------------

function layout(title: string, body: string): string {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
    <h1 style="font-size: 20px; color: #111827;">${title}</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <p style="font-size:12px;color:#6b7280;">WorkspaceShare — find and book the perfect workspace.</p>
  </div>`
}

export function welcomeEmail(name?: string | null) {
  return {
    subject: "Welcome to WorkspaceShare",
    html: layout(
      `Welcome${name ? `, ${name}` : ""}!`,
      `<p>Your account is ready. You can now book workspaces, list your own space, and complete your professional profile so others can discover you.</p>`,
    ),
  }
}

export interface BookingEmailData {
  spaceTitle: string
  startDate: string
  endDate: string
  totalPrice: number
  guestName?: string | null
}

export function bookingConfirmationEmail(data: BookingEmailData) {
  return {
    subject: `Booking confirmed: ${data.spaceTitle}`,
    html: layout(
      "Your booking is confirmed",
      `<p>Workspace: <strong>${data.spaceTitle}</strong></p>
       <p>Dates: ${data.startDate} → ${data.endDate}</p>
       <p>Total paid: €${data.totalPrice.toFixed(2)}</p>`,
    ),
  }
}

export function bookingStatusEmail(
  data: BookingEmailData & { status: string },
) {
  return {
    subject: `Booking ${data.status.toLowerCase()}: ${data.spaceTitle}`,
    html: layout(
      `Booking ${data.status.toLowerCase()}`,
      `<p>Your booking for <strong>${data.spaceTitle}</strong> (${data.startDate} → ${data.endDate}) is now <strong>${data.status}</strong>.</p>`,
    ),
  }
}

export interface ContactNotificationData {
  name: string
  email: string
  company: string
  subject: string
  message: string
  phone?: string
}

export function contactNotificationEmail(data: ContactNotificationData) {
  return {
    subject: `New contact request: ${data.subject}`,
    html: layout(
      "New contact request",
      `<p><strong>${data.name}</strong> (${data.email})${data.company ? ` from ${data.company}` : ""}${data.phone ? ` · ${data.phone}` : ""}</p>
       <p><strong>Subject:</strong> ${data.subject}</p>
       <p>${data.message.replace(/\n/g, "<br/>")}</p>`,
    ),
  }
}
