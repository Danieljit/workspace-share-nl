"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import Image from "next/image";
import { PlaceholderImage } from "@/components/ui/placeholder-image";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
type LifecycleAction = "cancel" | "confirm" | "reject";

interface SpaceSummary {
  id: string;
  title: string;
  address?: string | null;
  city?: string | null;
  photos?: unknown;
}

interface UserSummary {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface BookingDTO {
  id: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  userId: string;
  spaceId: string;
  space: SpaceSummary;
  user?: UserSummary;
}

interface MineResponse {
  asGuest: BookingDTO[];
  asHost: BookingDTO[];
}

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
    case "COMPLETED":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <CheckCircle className="mr-1 h-3 w-3" /> Completed
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

function firstPhoto(photos: unknown): string | null {
  try {
    let arr = photos;
    if (typeof photos === "string") arr = JSON.parse(photos);
    if (Array.isArray(arr) && typeof arr[0] === "string") return arr[0];
  } catch {
    // ignore malformed photo data
  }
  return null;
}

function placeholderType(title: string) {
  const t = title.toLowerCase();
  if (t.includes("meeting")) return "meeting" as const;
  if (t.includes("desk")) return "desk" as const;
  if (t.includes("office")) return "office" as const;
  return "generic" as const;
}

function BookingCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 h-48 md:h-auto bg-muted animate-pulse" />
        <div className="p-6 flex-1 space-y-4">
          <div className="h-5 w-24 bg-muted animate-pulse rounded" />
          <div className="h-6 w-2/3 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">{message}</h3>
        <p className="text-muted-foreground mb-6 text-center">
          When you have bookings they will appear here.
        </p>
        <Button asChild>
          <Link href="/spaces">Browse Workspaces</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface CardAction {
  label: string;
  action: LifecycleAction;
  variant?: "default" | "outline" | "destructive";
}

function BookingCard({
  booking,
  perspective,
  pending,
  onAction,
}: {
  booking: BookingDTO;
  perspective: "guest" | "host";
  pending: boolean;
  onAction: (id: string, action: LifecycleAction) => void;
}) {
  const photo = firstPhoto(booking.space.photos);
  const address = [booking.space.address, booking.space.city]
    .filter(Boolean)
    .join(", ");

  const actions: CardAction[] = [];
  if (perspective === "guest") {
    if (booking.status === "PENDING" || booking.status === "CONFIRMED") {
      actions.push({ label: "Cancel", action: "cancel", variant: "outline" });
    }
  } else {
    if (booking.status === "PENDING") {
      actions.push({ label: "Confirm", action: "confirm" });
      actions.push({ label: "Reject", action: "reject", variant: "destructive" });
    } else if (booking.status === "CONFIRMED") {
      actions.push({ label: "Cancel", action: "cancel", variant: "outline" });
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-1/4 h-48 md:h-auto">
          <div className="absolute inset-0">
            {photo ? (
              <Image
                src={photo}
                alt={booking.space.title}
                fill
                className="object-cover"
              />
            ) : (
              <PlaceholderImage
                type={placeholderType(booking.space.title)}
                fill
                alt={booking.space.title}
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

              <Link
                href={`/spaces/${booking.spaceId}`}
                className="hover:underline"
              >
                <h3 className="text-xl font-bold mb-1">{booking.space.title}</h3>
              </Link>

              {address && (
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{address}</span>
                </div>
              )}

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

              {perspective === "host" && booking.user && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Guest</h4>
                  <p>{booking.user.name || booking.user.email || "Guest"}</p>
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Total price</p>
                <p className="text-2xl font-bold">
                  €{booking.totalPrice.toFixed(2)}
                </p>
              </div>

              {actions.length > 0 && (
                <div className="space-y-2">
                  {actions.map((a) => (
                    <Button
                      key={a.action}
                      variant={a.variant}
                      className="w-full"
                      disabled={pending}
                      onClick={() => onAction(booking.id, a.action)}
                    >
                      {pending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {a.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function BookingsPage() {
  const [data, setData] = useState<MineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings/mine", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load your bookings");
      }
      const json: MineResponse = await res.json();
      setData(json);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load your bookings";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your bookings",
        variant: "destructive",
      });
      router.push("/signin");
      return;
    }
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, isLoading, router, toast, fetchBookings]);

  const handleAction = useCallback(
    async (id: string, action: LifecycleAction) => {
      setPendingId(id);
      try {
        const res = await fetch(`/api/bookings/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Action failed");
        }
        const labels: Record<LifecycleAction, string> = {
          cancel: "cancelled",
          confirm: "confirmed",
          reject: "rejected",
        };
        toast({
          title: "Success",
          description: `Booking ${labels[action]}.`,
        });
        await fetchBookings();
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Action failed",
          variant: "destructive",
        });
      } finally {
        setPendingId(null);
      }
    },
    [toast, fetchBookings],
  );

  const showSkeleton = isLoading || loading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">
          View and manage your trips and reservations on your spaces
        </p>
      </div>

      {showSkeleton ? (
        <div className="grid gap-6">
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-medium mb-2">
              Couldn&apos;t load bookings
            </h3>
            <p className="text-muted-foreground mb-6 text-center">{error}</p>
            <Button onClick={fetchBookings}>Try again</Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="trips" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trips">
              My trips ({data?.asGuest.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="reservations">
              Reservations on my spaces ({data?.asHost.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trips" className="mt-6">
            {!data || data.asGuest.length === 0 ? (
              <EmptyState message="No bookings yet" />
            ) : (
              <div className="grid gap-6">
                {data.asGuest.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    perspective="guest"
                    pending={pendingId === booking.id}
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reservations" className="mt-6">
            {!data || data.asHost.length === 0 ? (
              <EmptyState message="No bookings yet" />
            ) : (
              <div className="grid gap-6">
                {data.asHost.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    perspective="host"
                    pending={pendingId === booking.id}
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
