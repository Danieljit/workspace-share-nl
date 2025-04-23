import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      console.error("Payment intent creation failed: Unauthorized user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { spaceId, startDate, endDate, totalAmount } = await request.json();
    
    if (!spaceId || !startDate || !endDate || !totalAmount) {
      console.error("Payment intent creation failed: Missing required fields", { spaceId, startDate, endDate, totalAmount });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Fetch the space to verify it exists
    const space = await db.space.findUnique({
      where: { id: spaceId },
    });
    
    if (!space) {
      console.error(`Payment intent creation failed: Space not found with ID ${spaceId}`);
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }
    
    // Create a payment intent
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: "eur", // Using EUR for iDEAL support
        payment_method_types: ["card", "ideal"], // Support both credit cards and iDEAL
        metadata: {
          spaceId,
          userId: session.user.id,
          startDate,
          endDate,
        },
      });
      
      // Return the client secret to the client
      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (stripeError) {
      console.error("Stripe API error:", stripeError);
      return NextResponse.json({ 
        error: "Stripe API error", 
        details: stripeError instanceof Error ? stripeError.message : "Unknown Stripe error" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating payment intent:", error instanceof Error ? error.message : "Unknown error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
