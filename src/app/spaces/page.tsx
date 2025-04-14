"use client"

import { useEffect, useState, useRef, useMemo, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { NewsletterCTA, Footer } from "@/components/layout/footer"
import { SearchBar } from "@/components/search-bar"
import { useSearchParams, useRouter } from "next/navigation"
import { Map, MapRef } from "@/components/ui/map"
import Fuse from "fuse.js"

// This is a temporary type definition until we fetch real data
type Space = {
  id: string
  name: string
  description?: string
  location: string
  type: string
  price: number
  amenities: string
  images: string
  owner: {
    name: string
  }
}

// Create a separate component that uses useSearchParams
function SpacesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const searchQuery = searchParams.get("search") || ""
  const typeFilter = searchParams.get("type") || ""
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)
  const mapRef = useRef<MapRef>(null)

  useEffect(() => {
    // Fetch spaces data
    const fetchSpaces = async () => {
      try {
        const response = await fetch("/api/spaces")
        if (!response.ok) throw new Error("Failed to fetch spaces")
        const data = await response.json()
        
        // Ensure all spaces have the required properties
        const validatedSpaces = data.map((space: any) => ({
          ...space,
          // Ensure these properties exist with default values if missing
          id: space.id || `space-${Math.random().toString(36).substr(2, 9)}`,
          name: space.name || 'Unnamed Space',
          location: space.location || 'Unknown Location',
          type: space.type || 'Other',
          price: typeof space.price === 'number' ? space.price : 0,
          images: space.images || '',
          amenities: space.amenities || '',
          description: space.description || 'No description available',
          owner: space.owner || { name: 'Unknown Owner' }
        }))
        
        setSpaces(validatedSpaces)
      } catch (error) {
        console.error("Error fetching spaces:", error)
        setSpaces([])
      } finally {
        setLoading(false)
      }
    }

    fetchSpaces()
  }, [])

  // Use Fuse.js for fuzzy searching
  const filteredSpaces = useMemo(() => {
    // If there are no spaces yet, return empty array
    if (!spaces || spaces.length === 0) {
      return [];
    }
    
    // If no search query, just filter by type
    if (!searchQuery) {
      return spaces.filter(space => {
        // Safely check if type exists and matches filter
        if (!typeFilter) return true;
        if (!space || !space.type) return false;
        return space.type.toLowerCase().includes(typeFilter.toLowerCase());
      });
    }
    
    // Configure Fuse for fuzzy searching
    const fuseOptions = {
      keys: ['name', 'description', 'location', 'type'],
      threshold: 0.4, // Lower = more strict matching
      includeScore: true
    };
    
    try {
      const fuse = new Fuse(spaces, fuseOptions);
      const fuseResults = fuse.search(searchQuery);
      
      // Get the fuzzy search results
      const fuzzyResults = fuseResults.map(result => result.item);
      
      // Apply type filter to fuzzy results if needed
      if (!typeFilter) return fuzzyResults;
      
      return fuzzyResults.filter(space => {
        if (!space || !space.type) return false;
        return space.type.toLowerCase().includes(typeFilter.toLowerCase());
      });
    } catch (error) {
      console.error("Error in fuzzy search:", error);
      return [];
    }
  }, [spaces, searchQuery, typeFilter]);

  // Generate search suggestions when no results are found
  const searchSuggestions = useMemo(() => {
    if (!searchQuery || filteredSpaces.length > 0 || !spaces || spaces.length === 0) return [];
    
    try {
      // If no results, suggest similar searches based on space names
      const fuse = new Fuse(spaces, {
        keys: ['name', 'type', 'location'],
        threshold: 0.6 // More lenient for suggestions
      });
      
      const suggestions = fuse.search(searchQuery)
        .slice(0, 3) // Get top 3 suggestions
        .map(result => result.item.name || 'Unknown');
        
      return suggestions;
    } catch (error) {
      console.error("Error generating suggestions:", error);
      return [];
    }
  }, [searchQuery, filteredSpaces.length, spaces]);

  const handleSearch = (query: string) => {
    if (!query) return
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set("search", query)
    } else {
      params.delete("search")
    }
    router.push(`/spaces?${params.toString()}`)
  }

  const handleMarkerClick = (spaceId: string) => {
    if (!spaceId) return
    setSelectedSpaceId(spaceId)
    // Scroll to the space card if needed
    const spaceElement = document.getElementById(`space-${spaceId}`)
    if (spaceElement) {
      spaceElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle space card hover/selection
  const handleSpaceHover = (spaceId: string | null) => {
    setSelectedSpaceId(spaceId)
    // If we have a space ID and a map reference, fit bounds
    if (spaceId && mapRef.current?.mapInstance) {
      // Update the map with the selected marker
      mapRef.current.fitBounds()
    }
  }

  // Handle filter by type
  const handleFilterByType = (type: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (type) {
      params.set("type", type)
    } else {
      params.delete("type")
    }
    router.push(`/spaces?${params.toString()}`)
  }

  // Handle price sorting
  const handleSortByPrice = () => {
    const params = new URLSearchParams(searchParams.toString())
    const currentSort = params.get("sort") || ""
    
    if (currentSort === "price_asc") {
      params.set("sort", "price_desc")
    } else {
      params.set("sort", "price_asc")
    }
    
    router.push(`/spaces?${params.toString()}`)
  }
  
  // Sort spaces if needed
  const sortedSpaces = [...filteredSpaces]
  const sortParam = searchParams.get("sort")
  if (sortParam === "price_asc") {
    sortedSpaces.sort((a, b) => (a.price || 0) - (b.price || 0))
  } else if (sortParam === "price_desc") {
    sortedSpaces.sort((a, b) => (b.price || 0) - (a.price || 0))
  }

  // Convert spaces to location markers for the map
  const locationMarkers = useMemo(() => {
    if (!sortedSpaces || sortedSpaces.length === 0) return []
    
    try {
      return sortedSpaces.map(space => ({
        id: space.id || '',
        name: space.name || 'Unnamed Space',
        location: space.location || 'Unknown Location',
        price: typeof space.price === 'number' ? space.price : 0,
        type: space.type || 'Other',
        images: space.images && typeof space.images === 'string' 
          ? space.images.split(',').map(img => img.trim()) 
          : [],
        selected: space.id === selectedSpaceId
      }))
    } catch (error) {
      console.error('Error creating location markers:', error)
      return []
    }
  }, [sortedSpaces, selectedSpaceId])

  if (loading) {
    return (
      <main className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <p>Loading spaces...</p>
        </div>
      </main>
    )
  }

  // Safely handle rendering
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold">Available Spaces</h1>
              {(searchQuery || typeFilter) && (
                <p className="text-muted-foreground mt-2">
                  {searchQuery && `Showing results for "${searchQuery}"`}
                  {typeFilter && searchQuery && " with type "}
                  {typeFilter && <span className="font-medium">{typeFilter}</span>}
                  {(searchQuery || typeFilter) && ` (${sortedSpaces.length} spaces found)`}
                </p>
              )}
            </div>
            <div className="w-full md:w-1/3">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search spaces..."
                initialValue={searchQuery}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={!typeFilter ? "default" : "outline"} 
              size="sm"
              onClick={() => handleFilterByType(null)}
            >
              All
            </Button>
            <Button 
              variant={typeFilter === "desk" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleFilterByType("desk")}
            >
              Desk
            </Button>
            <Button 
              variant={typeFilter === "office" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleFilterByType("office")}
            >
              Office
            </Button>
            <Button 
              variant={typeFilter === "meeting" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleFilterByType("meeting")}
            >
              Meeting Room
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSortByPrice}
            >
              {sortParam === "price_asc" ? "Price ↑" : sortParam === "price_desc" ? "Price ↓" : "Price"}
            </Button>
          </div>
        </div>

        {sortedSpaces.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">No spaces found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find any workspaces matching your search criteria.
            </p>
            
            {searchSuggestions.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Did you mean:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {searchSuggestions.map(suggestion => (
                    <Button 
                      key={suggestion}
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSearch(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              variant="default"
              onClick={() => {
                router.push('/spaces')
              }}
            >
              View All Spaces
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="grid grid-cols-1 gap-6">
                {sortedSpaces.map((space) => {
                  if (!space || !space.id) return null;
                  
                  // Safely parse the first image URL
                  let imageUrl = '/placeholder.jpg';
                  try {
                    if (space.images) {
                      // Handle different image formats
                      if (typeof space.images === 'string') {
                        // Try to parse as JSON first
                        try {
                          const imagesArray = JSON.parse(space.images);
                          if (Array.isArray(imagesArray) && imagesArray.length > 0) {
                            imageUrl = imagesArray[0];
                          } else if (space.images.includes(',')) {
                            // If not valid JSON but contains commas, try comma-separated format
                            const imgArray = space.images.split(',');
                            if (imgArray && imgArray.length > 0) {
                              imageUrl = imgArray[0].trim();
                            }
                          } else {
                            // Just use the string directly
                            imageUrl = space.images.trim();
                          }
                        } catch (e) {
                          // If JSON parsing fails, treat as comma-separated or direct URL
                          if (space.images.includes(',')) {
                            const imgArray = space.images.split(',');
                            if (imgArray && imgArray.length > 0) {
                              imageUrl = imgArray[0].trim();
                            }
                          } else {
                            imageUrl = space.images.trim();
                          }
                        }
                      } else if (Array.isArray(space.images)) {
                        // It's already an array
                        // Ensure we have a string type for the image URL
                        const firstImage = space.images[0];
                        if (typeof firstImage === 'string') {
                          imageUrl = firstImage;
                        }
                      }
                    }
                  } catch (error) {
                    console.error('Error parsing image URL:', error);
                    // Fallback to placeholder
                    imageUrl = '/placeholder.jpg';
                  }
                    
                  return (
                    <div 
                      key={space.id} 
                      id={`space-${space.id}`}
                      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${selectedSpaceId === space.id ? 'ring-2 ring-primary' : ''}`}
                      onMouseEnter={() => handleSpaceHover(space.id)}
                      onMouseLeave={() => handleSpaceHover(null)}
                    >
                      <div className="relative h-48">
                        <Image 
                          src={imageUrl} 
                          alt={space.name || 'Workspace'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h2 className="text-xl font-semibold">{space.name || 'Unnamed Space'}</h2>
                          <span className="font-bold text-lg text-primary">
                            €{Math.round(space.price || 0)}/day
                          </span>
                        </div>
                        <p className="text-base text-muted-foreground mb-4">{space.location || 'Unknown Location'}</p>
                        <div className="flex justify-between items-center">
                          <span className="inline-block bg-muted text-muted-foreground text-sm px-2 py-1 rounded">
                            {space.type || 'Other'}
                          </span>
                          <Button asChild size="sm">
                            <Link href={`/spaces/${space.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="lg:col-span-2 h-[calc(100vh-200px)] sticky top-24">
              {locationMarkers && locationMarkers.length > 0 ? (
                <Map 
                  ref={mapRef}
                  locations={locationMarkers} 
                  onMarkerClick={handleMarkerClick}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">No locations to display</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <NewsletterCTA />
      <Footer />
    </main>
  )
}

// Wrap the component that uses useSearchParams in Suspense
export default function SpacesPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 flex justify-center"><p>Loading spaces...</p></div>}>
      <SpacesContent />
    </Suspense>
  )
}
