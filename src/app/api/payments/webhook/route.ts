import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") as string;
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err}`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    
    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Create booking record
        if (paymentIntent.metadata.spaceId && 
            paymentIntent.metadata.userId && 
            paymentIntent.metadata.startDate && 
            paymentIntent.metadata.endDate) {
          
          await db.booking.create({
            data: {
              spaceId: paymentIntent.metadata.spaceId,
              userId: paymentIntent.metadata.userId,
              startDate: new Date(paymentIntent.metadata.startDate),
              endDate: new Date(paymentIntent.metadata.endDate),
              totalPrice: paymentIntent.amount / 100, // Convert cents to dollars
              status: "CONFIRMED",
            },
          });
        }
        break;
        
      case "payment_intent.payment_failed":
        // Handle failed payment if needed
        break;
        
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
    bodyParser: false, // Don't parse the body, we need the raw body for signature verification
  },
};
