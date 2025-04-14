"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckStoragePage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const storedListings = localStorage.getItem("workspaceListings")
      if (storedListings) {
        setListings(JSON.parse(storedListings))
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">LocalStorage Contents</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : listings.length === 0 ? (
        <p>No listings found in localStorage</p>
      ) : (
        <div className="space-y-6">
          <p className="text-muted-foreground">Found {listings.length} listings:</p>
          
          {listings.map((listing, index) => (
            <Card key={listing.id || index}>
              <CardHeader>
                <CardTitle>{listing.title || "No title"}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(listing, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
