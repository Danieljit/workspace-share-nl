"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Euro, MapPin, Calendar, Clock, User } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load listings from localStorage
    try {
      const storedListings = localStorage.getItem("workspaceListings")
      if (storedListings) {
        setListings(JSON.parse(storedListings))
      }
    } catch (error) {
      console.error("Error loading listings:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Loading your listings...</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Workspace Listings</h1>
        <Link href="/test/list/form">
          <Button>Add New Listing</Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl font-medium mb-2">No listings found</h2>
          <p className="text-muted-foreground mb-6">You haven't created any workspace listings yet.</p>
          <Link href="/test/list/form">
            <Button>Create Your First Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              {listing.photos && listing.photos.length > 0 && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={listing.photos[0].preview} 
                    alt={listing.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2">{listing.workspaceType}</Badge>
                    <CardTitle className="line-clamp-2">{listing.title}</CardTitle>
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
                <Button variant="outline">Edit</Button>
                <Button>View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
