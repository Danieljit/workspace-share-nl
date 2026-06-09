import { describe, it, expect, vi, beforeEach } from "vitest"

// --- Mocks for the foundation/integration modules the webhook depends on. ---

const bookingFindUnique = vi.fn()
const bookingFindFirst = vi.fn()
const bookingUpdate = vi.fn()
const bookingCreate = vi.fn()

vi.mock("@/lib/db", () => ({
  db: {
    booking: {
      findUnique: (...args: unknown[]) => bookingFindUnique(...args),
      findFirst: (...args: unknown[]) => bookingFindFirst(...args),
      update: (...args: unknown[]) => bookingUpdate(...args),
      create: (...args: unknown[]) => bookingCreate(...args),
    },
  },
}))

const sendEmail = vi.fn()
vi.mock("@/lib/email", () => ({
  sendEmail: (...args: unknown[]) => sendEmail(...args),
  bookingConfirmationEmail: () => ({ subject: "s", html: "h" }),
}))

// Stripe is constructed lazily inside the route; we only need constructEvent.
let nextEvent: unknown
vi.mock("stripe", () => {
  return {
    default: class {
      webhooks = {
        constructEvent: () => nextEvent,
      }
    },
  }
})

import { POST } from "./route"

function makeRequest() {
  return {
    text: async () => "{}",
    headers: { get: () => "sig" },
  } as unknown as Parameters<typeof POST>[0]
}

const baseBooking = {
  id: "b1",
  spaceId: "sp1",
  startDate: new Date("2026-06-10"),
  endDate: new Date("2026-06-12"),
  totalPrice: 297,
  status: "PENDING",
  space: { title: "Cool Space" },
  user: { email: "guest@example.com", name: "Guest" },
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.STRIPE_SECRET_KEY = "sk_test_x"
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_x"
  bookingFindFirst.mockResolvedValue(null) // no conflicting CONFIRMED booking by default
  bookingUpdate.mockResolvedValue({})
  sendEmail.mockResolvedValue({ delivered: false })
})

describe("payment webhook", () => {
  it("confirms a PENDING booking on payment_intent.succeeded and emails the guest", async () => {
    bookingFindUnique.mockResolvedValue({ ...baseBooking })
    nextEvent = {
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1", metadata: { bookingId: "b1" } } },
    }

    const res = await POST(makeRequest())
    expect(res.status).toBe(200)

    expect(bookingUpdate).toHaveBeenCalledTimes(1)
    expect(bookingUpdate.mock.calls[0][0].data).toMatchObject({
      status: "CONFIRMED",
      paymentStatus: "succeeded",
    })
    expect(sendEmail).toHaveBeenCalledTimes(1)
    // Never creates bookings from the webhook.
    expect(bookingCreate).not.toHaveBeenCalled()
  })

  it("is idempotent: already-CONFIRMED booking is a no-op", async () => {
    bookingFindUnique.mockResolvedValue({ ...baseBooking, status: "CONFIRMED" })
    nextEvent = {
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1", metadata: { bookingId: "b1" } } },
    }

    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    expect(bookingUpdate).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("does not confirm when another CONFIRMED booking already holds the slot", async () => {
    bookingFindUnique.mockResolvedValue({ ...baseBooking })
    bookingFindFirst.mockResolvedValue({ id: "other", status: "CONFIRMED" })
    nextEvent = {
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1", metadata: { bookingId: "b1" } } },
    }

    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    // Records payment but does not set CONFIRMED.
    expect(bookingUpdate).toHaveBeenCalledTimes(1)
    expect(bookingUpdate.mock.calls[0][0].data).not.toHaveProperty("status")
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("cancels the booking on payment_intent.payment_failed", async () => {
    bookingFindUnique.mockResolvedValue({ ...baseBooking })
    nextEvent = {
      type: "payment_intent.payment_failed",
      data: { object: { id: "pi_1", metadata: { bookingId: "b1" } } },
    }

    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    expect(bookingUpdate.mock.calls[0][0].data).toMatchObject({
      status: "CANCELLED",
      paymentStatus: "failed",
    })
    expect(bookingCreate).not.toHaveBeenCalled()
  })
})
