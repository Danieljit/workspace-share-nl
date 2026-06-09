"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Euro, MapPin, Calendar, Plus, Loader2, PencilIcon, Eye, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { PlaceholderImage } from "@/components/ui/placeholder-image"

type DashboardListing = {
  id: string
  title: string
  city: string
  address: string
  workspaceType: string
  pricePerDay: number
  photo: string | null
  createdAt: string
  bookingCount: number
  revenue: number
}

type DashboardBooking = {
  id: string
  spaceId: string
  spaceTitle: string
  address: string
  startDate: string
  endDate: string
  status: string
  totalPrice: number
  createdAt: string
}

type DashboardData = {
  listings: DashboardListing[]
  bookings: DashboardBooking[]
}

function placeholderType(workspaceType: string) {
  switch (workspaceType) {
    case "OFFICE":
      return "office" as const
    case "DESK":
      return "desk" as const
    case "MEETING_ROOM":
      return "meeting" as const
    case "EVENT_SPACE":
      return "event" as const
    default:
      return "generic" as const
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your dashboard",
        variant: "destructive",
      })
      router.push("/signin")
      return
    }

    if (!isAuthenticated) return

    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/dashboard")
        if (!res.ok) {
          throw new Error("Failed to load dashboard data")
        }
        const json = (await res.json()) as DashboardData
        if (!cancelled) setData(json)
      } catch (err) {
        console.error("Error loading dashboard:", err)
        if (!cancelled) {
          setError("We couldn't load your dashboard. Please try again.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, isLoading, router, toast])

  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-4" />
            <h3 className="text-xl font-medium mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const listings = data?.listings ?? []
  const bookings = data?.bookings ?? []

  return (
    <div className="container mx-auto py-10">
      {/* User welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.name || "User"}!</h1>
        <p className="text-muted-foreground">Manage your workspace listings and bookings</p>
      </div>

      {/* Your Listings Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Workspace Listings</h2>
          <Link href="/spaces/list/form">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Listing
            </Button>
          </Link>
        </div>

        {listings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <h3 className="text-xl font-medium mb-2">No listings found</h3>
              <p className="text-muted-foreground mb-6">You haven&apos;t created any workspace listings yet.</p>
              <Link href="/spaces/list/form">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Listing
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <Link href={`/spaces/${listing.id}`}>
                  <div className="h-48 overflow-hidden hover:opacity-90 transition-opacity cursor-pointer">
                    {listing.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.photo}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PlaceholderImage
                        type={placeholderType(listing.workspaceType)}
                        fill
                        alt={listing.title}
                      />
                    )}
                  </div>
                </Link>

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {listing.workspaceType.replace("_", " ")}
                      </Badge>
                      <Link href={`/spaces/${listing.id}`}>
                        <CardTitle className="line-clamp-2 hover:text-primary cursor-pointer">
                          {listing.title}
                        </CardTitle>
                      </Link>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg">€{listing.pricePerDay}</span>
                      <span className="text-muted-foreground text-sm">/day</span>
                    </div>
                  </div>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.address}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{listing.bookingCount} bookings</span>
                    </div>
                    <div className="flex items-center">
                      <Euro className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{listing.revenue.toFixed(2)} earned</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                  <Link href={`/dashboard/edit/${listing.id}`}>
                    <Button variant="outline">
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/spaces/${listing.id}`}>
                    <Button>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Recent Bookings</h2>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <h3 className="text-xl font-medium mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-6">Your listings haven&apos;t received any bookings yet.</p>
              <Link href="/dashboard/listings">
                <Button>Manage Listings</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{booking.spaceTitle}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {booking.address}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        booking.status === "CONFIRMED" || booking.status === "COMPLETED"
                          ? "default"
                          : booking.status === "PENDING"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {new Date(booking.startDate).toLocaleDateString()} -{" "}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-medium">€{booking.totalPrice.toFixed(2)}</div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end pt-0">
                  <Link href={`/spaces/${booking.spaceId}`}>
                    <Button variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
