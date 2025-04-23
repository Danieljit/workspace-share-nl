"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Building, Coffee } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentForm } from "@/components/payments/payment-form";
import { getStripe, createPaymentIntent } from "@/lib/stripe";

export default function BookingConfirmationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Get query parameters
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const totalDays = searchParams.get('days');
  const totalPrice = searchParams.get('price');
  
  const [space, setSpace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  
  useEffect(() => {
    // Redirect if no dates selected
    if (!startDate || !endDate || !totalDays || !totalPrice) {
      router.push(`/spaces/${params.id}`);
      return;
    }
    
    // Fetch space details
    const fetchSpace = async () => {
      try {
        const response = await fetch(`/api/spaces/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch space details');
        }
        const data = await response.json();
        setSpace(data);
        
        // Create payment intent
        try {
          const totalAmount = parseFloat(totalPrice || '0') + (parseFloat(totalPrice || '0') * 0.1); // Add service fee
          const { clientSecret } = await createPaymentIntent({
            spaceId: params.id,
            startDate,
            endDate,
            totalAmount,
          });
          
          setClientSecret(clientSecret);
        } catch (paymentError) {
          console.error('Payment intent creation error:', paymentError);
          toast({
            title: "Payment setup failed",
            description: paymentError instanceof Error ? paymentError.message : "Could not set up payment. Please try again later.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching space:', error);
        toast({
          title: "Error",
          description: "Could not load workspace details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpace();
  }, [params.id, startDate, endDate, totalDays, totalPrice, router, toast]);
  
  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Redirect to the bookings dashboard
    router.push(`/dashboard/bookings/payment-success?success=true&payment=${paymentIntentId}`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!space) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Workspace not found</h1>
          <p className="mt-2 text-muted-foreground">The workspace you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="mt-4">
            <Link href="/spaces">Browse other workspaces</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Format the space data
  const title = space.title || space.name || 'Workspace';
  const location = space.address ? `${space.address}, ${space.city || ''}` : (space.location || 'Location not specified');
  const pricePerDay = space.pricePerDay || space.price || 0;
  
  // Calculate service fee (10% of subtotal)
  const subtotal = parseFloat(totalPrice || '0');
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;
  
  // Format dates for display
  const formattedStartDate = startDate ? format(new Date(startDate), 'MMM d, yyyy') : '';
  const formattedEndDate = endDate ? format(new Date(endDate), 'MMM d, yyyy') : '';
  
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Booking confirmation</h1>
        <p className="text-muted-foreground">Review your booking details before payment</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Booking details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your trip</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Dates</h3>
                <p className="text-muted-foreground">
                  {formattedStartDate} - {formattedEndDate}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Guests</h3>
                <p className="text-muted-foreground">1 guest</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payment method</h2>
            
            {clientSecret && (
              <Elements
                stripe={getStripe()}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#0ea5e9',
                      colorBackground: '#ffffff',
                      colorText: '#1e293b',
                    },
                  },
                }}
              >
                <PaymentForm 
                  clientSecret={clientSecret}
                  amount={Math.round(total * 100)}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            )}
          </Card>
        </div>
        
        {/* Right column - Booking summary */}
        <div className="md:col-span-1">
          <Card className="p-6 sticky top-6">
            <div className="flex items-start gap-4 pb-6 border-b">
              {space.photos || space.images ? (
                <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image 
                    src={Array.isArray(space.photos) ? space.photos[0] : 
                         (typeof space.photos === 'string' ? JSON.parse(space.photos)[0] : 
                          (space.images ? (typeof space.images === 'string' ? 
                                         JSON.parse(space.images)[0] : space.images[0]) : 
                           '/placeholder.jpg'))}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                  <Building className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              
              <div>
                <h3 className="font-medium line-clamp-1">{title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{location}</p>
                <div className="flex items-center mt-1 text-sm">
                  <Coffee className="h-3.5 w-3.5 mr-1" />
                  <span>{space.workspaceType || space.type || 'Workspace'}</span>
                </div>
              </div>
            </div>
            
            <div className="py-6 border-b space-y-4">
              <h3 className="text-lg font-medium">Price details</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>${pricePerDay} × {totalDays} days</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total (USD)</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
