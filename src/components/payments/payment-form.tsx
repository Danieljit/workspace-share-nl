"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement, AddressElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
}

export function PaymentForm({ clientSecret, amount, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/bookings/payment-success?success=true`,
        },
        redirect: "if_required",
      });
      
      if (error) {
        toast({
          title: "Payment failed",
          description: error.message || "An error occurred during payment processing.",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast({
          title: "Payment successful",
          description: "Your booking has been confirmed.",
        });
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{
        layout: {
          type: 'tabs',
          defaultCollapsed: false,
        },
      }} />
      
      <AddressElement options={{ 
        mode: "billing",
        fields: {
          phone: 'always',
        },
        validation: {
          phone: {
            required: 'always',
          },
        },
      }} />
      
      <Button 
        type="submit" 
        className="w-full" 
        size="lg" 
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? "Processing..." : `Pay €${(amount / 100).toFixed(2)}`}
      </Button>
    </form>
  );
}
