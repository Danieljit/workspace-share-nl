"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Euro, MapPin, Calendar, Clock, User, Plus, Loader2, PencilIcon, Eye } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { PlaceholderImage } from "@/components/ui/placeholder-image"

export default function DashboardPage() {
  const [listings, setListings] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your dashboard",
        variant: "destructive"
      })
      router.push("/signin")
      return
    }

    // Load listings from localStorage for demo purposes
    // In a real app, this would fetch from the API
    if (isAuthenticated) {
      try {
        const storedListings = localStorage.getItem("workspaceListings")
        if (storedListings) {
          setListings(JSON.parse(storedListings))
        }
        
        // Mock bookings data for demonstration
        setBookings([
          {
            id: "booking1",
            spaceTitle: "Enschede Innovation Hub",
            startDate: new Date(2025, 3, 15),
            endDate: new Date(2025, 3, 17),
            totalPrice: 75,
            status: "CONFIRMED",
            address: "Oude Markt 24, Enschede"
          },
          {
            id: "booking2",
            spaceTitle: "Hengelo Creative Studio",
            startDate: new Date(2025, 4, 5),
            endDate: new Date(2025, 4, 6),
            totalPrice: 30,
            status: "PENDING",
            address: "Marktstraat 15, Hengelo"
          }
        ])
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
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
          <Link href="/test/list/form">
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
              <p className="text-muted-foreground mb-6">You haven't created any workspace listings yet.</p>
              <Link href="/test/list/form">
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
                {/* Make the image clickable to view details */}
                <Link href={`/spaces/${listing.id}`}>
                  {listing.photos && listing.photos.length > 0 ? (
                    <div className="h-48 overflow-hidden hover:opacity-90 transition-opacity cursor-pointer">
                      <img 
                        src={listing.photos[0].preview} 
                        alt={listing.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 overflow-hidden hover:opacity-90 transition-opacity cursor-pointer">
                      <PlaceholderImage
                        type={listing.workspaceType === "OFFICE" ? "office" : 
                              listing.workspaceType === "DESK" ? "desk" : 
                              listing.workspaceType === "MEETING_ROOM" ? "meeting" : 
                              listing.workspaceType === "EVENT_SPACE" ? "event" : "generic"}
                        fill
                        alt={listing.title}
                      />
                    </div>
                  )}
                </Link>
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2">{listing.workspaceType}</Badge>
                      {/* Make the title clickable to view details */}
                      <Link href={`/spaces/${listing.id}`}>
                        <CardTitle className="line-clamp-2 hover:text-primary cursor-pointer">
                          {listing.title}
                        </CardTitle>
                      </Link>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg">
                        €{listing.pricing?.pricePerDay}
                      </span>
                      <span className="text-muted-foreground text-sm">/day</span>
                    </div>
                  </div>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.location?.address}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Availability</h3>
                      <div className="flex flex-wrap gap-1">
                        {listing.availability && Object.entries(listing.availability).map(([day, data]: [string, any]) => (
                          data.enabled && (
                            <Badge key={day} variant="secondary" className="text-xs">
                              {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                            </Badge>
                          )
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{listing.workspaceDetails?.capacity || "N/A"} people</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Response in {listing.hostInfo?.responseTime || "24h"}</span>
                      </div>
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

      {/* Your Bookings Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Your Bookings</h2>
        
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <h3 className="text-xl font-medium mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-6">You haven't made any bookings yet.</p>
              <Link href="/spaces">
                <Button>
                  Find Workspaces
                </Button>
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
                      variant={booking.status === "CONFIRMED" ? "default" : 
                              booking.status === "PENDING" ? "outline" : "secondary"}
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
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-medium">
                      €{booking.totalPrice.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end pt-0">
                  <Link href={`/spaces/${booking.id}`}>
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
