"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  Calendar, 
  MapPin, 
  Euro, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import Image from "next/image";
import { PlaceholderImage } from "@/components/ui/placeholder-image";

// Booking status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="mr-1 h-3 w-3" /> Confirmed
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <XCircle className="mr-1 h-3 w-3" /> Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <AlertCircle className="mr-1 h-3 w-3" /> {status}
        </Badge>
      );
  }
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your bookings",
        variant: "destructive"
      });
      router.push("/signin");
      return;
    }

    // Fetch bookings data
    const fetchBookings = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockBookings = [
          {
            id: "booking1",
            spaceId: "space1",
            spaceTitle: "Enschede Innovation Hub",
            spaceImage: "/images/spaces/office-1.jpg",
            startDate: new Date(2025, 3, 15),
            endDate: new Date(2025, 3, 17),
            totalPrice: 75,
            status: "CONFIRMED",
            address: "Oude Markt 24, Enschede",
            hostName: "Martijn de Vries"
          },
          {
            id: "booking2",
            spaceId: "space2",
            spaceTitle: "Hengelo Creative Studio",
            spaceImage: "/images/spaces/office-2.jpg",
            startDate: new Date(2025, 4, 5),
            endDate: new Date(2025, 4, 6),
            totalPrice: 30,
            status: "PENDING",
            address: "Marktstraat 15, Hengelo",
            hostName: "Lisa Jansen"
          },
          {
            id: "booking3",
            spaceId: "space3",
            spaceTitle: "Amsterdam Canal View Office",
            spaceImage: "/images/spaces/office-3.jpg",
            startDate: new Date(2025, 2, 10),
            endDate: new Date(2025, 2, 12),
            totalPrice: 120,
            status: "COMPLETED",
            address: "Herengracht 123, Amsterdam",
            hostName: "Jan de Boer"
          },
          {
            id: "booking4",
            spaceId: "space4",
            spaceTitle: "Rotterdam Modern Workspace",
            spaceImage: "/images/spaces/office-4.jpg",
            startDate: new Date(2025, 1, 20),
            endDate: new Date(2025, 1, 25),
            totalPrice: 200,
            status: "CANCELLED",
            address: "Witte de Withstraat 50, Rotterdam",
            hostName: "Emma Visser"
          }
        ];
        
        setBookings(mockBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load your bookings. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, isLoading, router, toast]);

  // Filter bookings by status
  const upcomingBookings = bookings.filter(booking => 
    (booking.status === "CONFIRMED" || booking.status === "PENDING") && 
    new Date(booking.endDate) >= new Date()
  );
  
  const pastBookings = bookings.filter(booking => 
    booking.status === "COMPLETED" || 
    (booking.status === "CONFIRMED" && new Date(booking.endDate) < new Date())
  );
  
  const cancelledBookings = bookings.filter(booking => 
    booking.status === "CANCELLED"
  );

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">
          View and manage all your workspace bookings
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No upcoming bookings</h3>
                <p className="text-muted-foreground mb-6 text-center">
                  You don't have any upcoming bookings. Ready to find your next workspace?
                </p>
                <Button asChild>
                  <Link href="/spaces">Browse Workspaces</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No past bookings</h3>
                <p className="text-muted-foreground mb-6 text-center">
                  You don't have any past bookings yet.
                </p>
                <Button asChild>
                  <Link href="/spaces">Browse Workspaces</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isPast />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cancelled" className="mt-6">
          {cancelledBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No cancelled bookings</h3>
                <p className="text-muted-foreground mb-6 text-center">
                  You don't have any cancelled bookings.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {cancelledBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isCancelled />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Booking card component
function BookingCard({ booking, isPast = false, isCancelled = false }: { 
  booking: any;
  isPast?: boolean;
  isCancelled?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-1/4 h-48 md:h-auto">
          <div className="absolute inset-0">
            {booking.spaceImage ? (
              <Image 
                src={booking.spaceImage} 
                alt={booking.spaceTitle}
                fill
                className="object-cover"
              />
            ) : (
              <PlaceholderImage 
                type={booking.spaceTitle.toLowerCase().includes("meeting") ? "meeting" : 
                      booking.spaceTitle.toLowerCase().includes("desk") ? "desk" : 
                      booking.spaceTitle.toLowerCase().includes("office") ? "office" : "generic"}
                fill
                alt={booking.spaceTitle}
              />
            )}
          </div>
        </div>
        
        <div className="p-6 flex-1">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={booking.status} />
                <span className="text-sm text-muted-foreground">
                  Booking ID: {booking.id}
                </span>
              </div>
              
              <Link href={`/spaces/${booking.spaceId}`} className="hover:underline">
                <h3 className="text-xl font-bold mb-1">{booking.spaceTitle}</h3>
              </Link>
              
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{booking.address}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Check-in</h4>
                  <p>{format(new Date(booking.startDate), "EEE, MMM d, yyyy")}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Check-out</h4>
                  <p>{format(new Date(booking.endDate), "EEE, MMM d, yyyy")}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Host</h4>
                <p>{booking.hostName}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Total price</p>
                <p className="text-2xl font-bold">€{booking.totalPrice.toFixed(2)}</p>
              </div>
              
              {!isPast && !isCancelled && (
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/bookings/${booking.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    Contact Host
                  </Button>
                </div>
              )}
              
              {isPast && (
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/bookings/${booking.id}`}>
                      View Receipt
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    Book Again
                  </Button>
                </div>
              )}
              
              {isCancelled && (
                <Button asChild className="w-full">
                  <Link href={`/spaces/${booking.spaceId}`}>
                    View Space
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
