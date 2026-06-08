"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Calendar, ArrowRight, Clock, XCircle } from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  // Stripe appends these to the return_url after a redirect-based confirmation
  // (e.g. iDEAL). Fall back to a legacy "payment" param if present.
  const paymentId =
    searchParams.get("payment_intent") || searchParams.get("payment");
  const redirectStatus = searchParams.get("redirect_status");

  // "succeeded" or no status (card flow without redirect) → treat as success.
  // "processing" → payment is still settling. Anything else → failed.
  const outcome: "success" | "processing" | "failed" =
    !redirectStatus || redirectStatus === "succeeded"
      ? "success"
      : redirectStatus === "processing"
        ? "processing"
        : "failed";

  // Auto-redirect to bookings only on a successful outcome.
  useEffect(() => {
    if (outcome !== "success") return;
    if (countdown <= 0) {
      router.push("/dashboard/bookings");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router, outcome]);

  const ui = {
    success: {
      icon: <CheckCircle className="h-12 w-12 text-green-600" />,
      iconBg: "bg-green-100",
      title: "Payment Successful!",
      message:
        "Your booking has been confirmed. You will receive a confirmation email shortly.",
    },
    processing: {
      icon: <Clock className="h-12 w-12 text-yellow-600" />,
      iconBg: "bg-yellow-100",
      title: "Payment Processing",
      message:
        "Your payment is being processed. Your booking will be confirmed as soon as it completes — check your bookings shortly.",
    },
    failed: {
      icon: <XCircle className="h-12 w-12 text-red-600" />,
      iconBg: "bg-red-100",
      title: "Payment Not Completed",
      message:
        "We couldn't confirm your payment. No booking was created. Please try again from the space page.",
    },
  }[outcome];

  return (
    <div className="container mx-auto py-16 px-4 max-w-3xl">
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div
            className={`h-24 w-24 rounded-full ${ui.iconBg} flex items-center justify-center`}
          >
            {ui.icon}
          </div>

          <h1 className="text-3xl font-bold">{ui.title}</h1>

          <p className="text-muted-foreground max-w-md">{ui.message}</p>

          {paymentId && (
            <p className="text-sm text-muted-foreground">
              Payment ID: {paymentId}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard/bookings">
                <Calendar className="mr-2 h-4 w-4" />
                View My Bookings
              </Link>
            </Button>

            <Button asChild size="lg">
              <Link href="/spaces">
                Find More Spaces
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {outcome === "success" && (
            <p className="text-sm text-muted-foreground mt-6">
              Redirecting to your bookings in {countdown} seconds...
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-16 px-4 max-w-3xl">
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-muted animate-pulse" />
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            </div>
          </Card>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
