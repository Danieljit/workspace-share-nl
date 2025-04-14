"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = () => {
    setLoading(true)
    try {
      const storedListings = localStorage.getItem("workspaceListings")
      if (storedListings) {
        const parsedListings = JSON.parse(storedListings)
        setListings(parsedListings)
        console.log("Loaded listings:", parsedListings)
      } else {
        setListings([])
        console.log("No listings found in localStorage")
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  const searchForListing = (searchTerm: string) => {
    const foundListings = listings.filter(listing => 
      listing.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    return foundListings.length > 0
  }

  const hasMijnMooieWerkplek = searchForListing("mijn mooie werkplek")

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Debug: LocalStorage Contents</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-6">
          <div className="p-4 border rounded-md bg-yellow-50">
            <h2 className="text-xl font-semibold mb-2">Search Results</h2>
            <p className="mb-2">
              <strong>"Mijn mooie werkplek"</strong> is {hasMijnMooieWerkplek ? "found" : "not found"} in localStorage.
            </p>
            <p>Total listings: {listings.length}</p>
          </div>
          
          <Button onClick={loadListings} className="mb-4">Refresh Data</Button>
          
          {listings.length === 0 ? (
            <Card>
              <CardContent className="py-6">
                <p>No listings found in localStorage</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {listings.map((listing, index) => (
                <Card key={listing.id || index}>
                  <CardHeader>
                    <CardTitle>{listing.title || "No title"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p><strong>ID:</strong> {listing.id}</p>
                        <p><strong>Type:</strong> {listing.workspaceType}</p>
                        <p><strong>Address:</strong> {listing.location?.address || listing.address || "Not specified"}</p>
                      </div>
                      <div>
                        <p><strong>Created:</strong> {listing.createdAt ? new Date(listing.createdAt).toLocaleString() : "Unknown"}</p>
                        <p><strong>Updated:</strong> {listing.updatedAt ? new Date(listing.updatedAt).toLocaleString() : "Unknown"}</p>
                      </div>
                    </div>
                    <details>
                      <summary className="cursor-pointer font-medium text-primary hover:underline">View Full Data</summary>
                      <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 mt-2">
                        {JSON.stringify(listing, null, 2)}
                      </pre>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
