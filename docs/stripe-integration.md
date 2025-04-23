# Stripe Payment Integration Guide

This document provides instructions for setting up and testing the Stripe payment integration in the WorkspaceShare application.

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

You can obtain these keys from your [Stripe Dashboard](https://dashboard.stripe.com/apikeys).

### 2. Stripe CLI for Local Development

To test webhooks locally:

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login to your Stripe account:
   ```
   stripe login
   ```
3. Run the local webhook listener script:
   ```
   node src/scripts/stripe-webhook-local.js
   ```
4. Copy the generated webhook secret to your `.env.local` file

## Payment Flow

The payment flow in WorkspaceShare works as follows:

1. User selects dates on the space details page
2. User is redirected to the booking confirmation page
3. The application creates a payment intent via the `/api/payments/create-intent` endpoint
4. User enters payment details using the Stripe Elements form
5. On successful payment, the user is redirected to their bookings dashboard
6. Stripe sends a webhook notification to confirm the payment
7. The webhook handler creates a booking record in the database

## Supported Payment Methods

The integration supports the following payment methods:

- Credit/Debit cards (Visa, Mastercard, etc.)
- iDEAL (Netherlands-specific payment method)

## Testing

Use these Stripe test cards for testing:

- **Successful payment**: `4242 4242 4242 4242`
- **Authentication required**: `4000 0025 0000 3155`
- **Payment declined**: `4000 0000 0000 9995`

For iDEAL testing, use the test bank option in the payment form.

## Deployment

When deploying to production:

1. Replace test keys with production keys
2. Set up a production webhook endpoint in the Stripe Dashboard
3. Update the `STRIPE_WEBHOOK_SECRET` with the production webhook signing secret
4. Ensure your Netlify environment variables are configured correctly

## Troubleshooting

- **Payment form not loading**: Check that your publishable key is correctly set in the environment variables
- **Webhook failures**: Verify the webhook secret and ensure the webhook endpoint is accessible
- **Payment succeeded but no booking created**: Check the webhook logs for errors

## Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe.js & Elements](https://stripe.com/docs/js)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
