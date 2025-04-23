import { loadStripe } from "@stripe/stripe-js";

// Load the Stripe instance once and reuse it
let stripePromise: ReturnType<typeof loadStripe> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Helper function to create a payment intent
export const createPaymentIntent = async ({
  spaceId,
  startDate,
  endDate,
  totalAmount,
}: {
  spaceId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
}) => {
  try {
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceId,
        startDate,
        endDate,
        totalAmount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment intent creation failed:', errorData);
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};
