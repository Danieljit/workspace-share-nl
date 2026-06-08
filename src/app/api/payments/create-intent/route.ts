import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Stripe from "stripe";
import { requireUser, apiErrorResponse, ApiError } from "@/lib/session";
import { calculateBookingPrice, pricesMatch } from "@/lib/pricing";

/**
 * Lazy Stripe init: building the SDK at module load with a non-null assertion
 * breaks the build when STRIPE_SECRET_KEY is absent. Construct it on demand.
 */
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new ApiError(500, "Stripe is not configured");
  return new Stripe(key);
}

/**
 * Payment intent creation — step 2 of the booking+payment flow.
 *
 * Takes a { bookingId } for an existing PENDING booking owned by the caller,
 * recomputes the amount server-side from the space + dates (the client amount is
 * ignored; if a client total is supplied it must match the server total), then
 * creates one Stripe PaymentIntent, persists its id on the booking, and returns
 * the clientSecret. The webhook later confirms THIS booking by that id.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const { bookingId, totalAmount } = await request.json();

    if (!bookingId) {
      throw new ApiError(400, "Missing bookingId");
    }

    // Look up the PENDING booking and ensure it belongs to the caller.
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { space: true },
    });

    if (!booking || booking.userId !== user.id) {
      throw new ApiError(404, "Booking not found");
    }
    if (booking.status !== "PENDING") {
      throw new ApiError(409, "Booking is not awaiting payment");
    }

    // Authoritative amount — recomputed from the space + dates, never the client.
    const breakdown = calculateBookingPrice(
      booking.space,
      booking.startDate,
      booking.endDate,
    );
    const serverTotal = breakdown.total;

    // If the client sent a total, it is a display value only — reject mismatches.
    if (totalAmount !== undefined && !pricesMatch(totalAmount, serverTotal)) {
      throw new ApiError(409, "Price mismatch — please refresh and try again");
    }

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(serverTotal * 100), // EUR cents
      currency: "eur",
      payment_method_types: ["card", "ideal"],
      metadata: {
        bookingId: booking.id,
        spaceId: booking.spaceId,
        userId: user.id,
      },
    });

    // Persist the link so the webhook can confirm this exact booking idempotently.
    await db.booking.update({
      where: { id: booking.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
