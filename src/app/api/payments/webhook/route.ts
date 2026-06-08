import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Stripe from "stripe";
import { sendEmail, bookingConfirmationEmail } from "@/lib/email";
import { format } from "date-fns";

/**
 * Stripe webhook — step 3 of the booking+payment flow.
 *
 * It NEVER creates bookings. It only transitions an existing booking (created by
 * POST /api/bookings and linked by POST /api/payments/create-intent) so that
 * exactly one CONFIRMED booking results per successful payment. Handlers are
 * idempotent: a payment_intent.succeeded retry on an already-CONFIRMED booking
 * is a no-op.
 */

/** Lazy Stripe init so an absent STRIPE_SECRET_KEY doesn't break the build. */
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured");
  return new Stripe(key);
}

/** Find the booking a PaymentIntent refers to (by stored id, then metadata). */
async function findBookingForIntent(paymentIntent: Stripe.PaymentIntent) {
  const byIntentId = await db.booking.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: { space: true, user: true },
  });
  if (byIntentId) return byIntentId;

  const bookingId = paymentIntent.metadata?.bookingId;
  if (!bookingId) return null;
  return db.booking.findUnique({
    where: { id: bookingId },
    include: { space: true, user: true },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Webhook misconfigured: STRIPE_WEBHOOK_SECRET missing");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err}`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const booking = await findBookingForIntent(paymentIntent);

        if (!booking) {
          console.error(
            `payment_intent.succeeded: no booking for intent ${paymentIntent.id}`,
          );
          break;
        }

        // Idempotent: already confirmed → nothing to do.
        if (booking.status === "CONFIRMED") {
          break;
        }

        // Re-check for a conflicting CONFIRMED booking (a different one) to guard
        // against the slot being genuinely taken between booking creation and
        // payment confirmation. We deliberately only consider CONFIRMED bookings
        // here — other PENDING bookings (e.g. an abandoned/duplicate attempt by
        // the same user) must NOT block confirming a payment that already
        // succeeded, otherwise money is captured with no confirmed booking.
        const confirmedConflict = await db.booking.findFirst({
          where: {
            spaceId: booking.spaceId,
            id: { not: booking.id },
            status: "CONFIRMED",
            startDate: { lte: booking.endDate },
            endDate: { gte: booking.startDate },
          },
        });
        if (confirmedConflict) {
          console.error(
            `payment_intent.succeeded: slot already CONFIRMED elsewhere for booking ${booking.id}`,
          );
          await db.booking.update({
            where: { id: booking.id },
            data: { paymentStatus: "succeeded" },
          });
          // TODO: trigger a refund — the slot was confirmed by another booking
          // before this payment completed (double-booking race).
          break;
        }

        await db.booking.update({
          where: { id: booking.id },
          data: { status: "CONFIRMED", paymentStatus: "succeeded" },
        });

        const guestEmail = booking.user?.email;
        if (guestEmail) {
          const { subject, html } = bookingConfirmationEmail({
            spaceTitle: booking.space.title,
            startDate: format(booking.startDate, "MMM d, yyyy"),
            endDate: format(booking.endDate, "MMM d, yyyy"),
            totalPrice: booking.totalPrice,
            guestName: booking.user?.name,
          });
          await sendEmail({ to: guestEmail, subject, html });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const booking = await findBookingForIntent(paymentIntent);

        if (booking && booking.status !== "CONFIRMED") {
          await db.booking.update({
            where: { id: booking.id },
            data: { status: "CANCELLED", paymentStatus: "failed" },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false, // Need the raw body for signature verification.
  },
};
