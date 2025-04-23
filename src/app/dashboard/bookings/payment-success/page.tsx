"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  // Get payment ID from URL if available
  const paymentId = searchParams.get('payment');
  
  // Auto-redirect to bookings page after 5 seconds
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/dashboard/bookings');
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, router]);
  
  return (
    <div className="container mx-auto py-16 px-4 max-w-3xl">
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          
          <p className="text-muted-foreground max-w-md">
            Your booking has been confirmed. You will receive a confirmation email shortly.
          </p>
          
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
          
          <p className="text-sm text-muted-foreground mt-6">
            Redirecting to your bookings in {countdown} seconds...
          </p>
        </div>
      </Card>
    </div>
  );
}
