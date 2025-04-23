import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"
import { BookingForm } from "@/components/spaces/booking-form"
import { AmenitiesDialog } from "@/components/spaces/amenities-dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Testimonials } from "@/components/ui/testimonials"
import { testimonials } from "@/data/testimonials"
import { Map } from "@/components/ui/map"
import { NewsletterCTA, Footer } from "@/components/layout/footer"

const TOP_AMENITIES = [
  { icon: "wifi", label: "High-speed WiFi" },
  { icon: "desktop_windows", label: "External Monitor" },
  { icon: "local_parking", label: "Free Parking" },
  { icon: "coffee", label: "Premium Coffee" },
  { icon: "meeting_room", label: "Meeting Rooms" },
  { icon: "print", label: "Printer Access" },
  { icon: "ac_unit", label: "Air Conditioning" },
  { icon: "kitchen", label: "Kitchen" },
  { icon: "chair", label: "Ergonomic Chair" },
  { icon: "phone", label: "Phone Booth" },
]

// Default amenities to show if none are found
const DEFAULT_AMENITIES = [
  "High-speed WiFi",
  "Comfortable Desk",
  "Coffee & Tea",
  "Meeting Room Access",
  "Printer Access",
  "Air Conditioning",
  "Kitchen Access",
  "Restroom Access",
  "Secure Building",
  "Business Hours Access"
]

export default async function SpacePage({ params }: { params: { id: string } }) {
  const space = await db.space.findUnique({
    where: { id: params.id },
    include: { owner: true },
  })

  if (!space) {
    notFound()
  }

  // Use type assertion to handle both old and new schema formats
  const spaceAny = space as any
  
  // Check if we're dealing with new schema (has 'title' field) or old schema
  const isNewSchema = 'title' in spaceAny
  
  // Map fields based on schema format
  const spaceName = isNewSchema ? spaceAny.title : spaceAny.name
  const spaceLocation = isNewSchema 
    ? `${spaceAny.address || ''}, ${spaceAny.city || ''}`.replace(', ,', ',').replace(/^, |, $/g, '') 
    : spaceAny.location || 'Unknown Location'
  const spacePrice = isNewSchema ? spaceAny.pricePerDay : spaceAny.price
  const spaceType = isNewSchema ? spaceAny.workspaceType : spaceAny.type
  const spaceCapacity = spaceAny.capacity || 1
  
  // Extract coordinates if available in new schema
  let coordinates = null
  if (isNewSchema && spaceAny.coordinates) {
    try {
      if (typeof spaceAny.coordinates === 'string') {
        coordinates = JSON.parse(spaceAny.coordinates)
      } else if (typeof spaceAny.coordinates === 'object') {
        coordinates = spaceAny.coordinates
      }
    } catch (error) {
      console.error('Error parsing coordinates:', error)
    }
  }
  
  // Handle images from both schema formats
  const imagesField = isNewSchema ? spaceAny.photos : spaceAny.images
  let images: string[] = []
  
  try {
    if (typeof imagesField === 'string') {
      images = JSON.parse(imagesField || '[]')
    } else if (Array.isArray(imagesField)) {
      images = imagesField
    } else if (imagesField && typeof imagesField === 'object') {
      images = Object.values(imagesField)
    }
  } catch (error) {
    console.error('Error parsing images:', error)
    images = []
  }
  
  // Parse amenities and handle both array and object formats
  const amenitiesField = isNewSchema ? spaceAny.amenities : spaceAny.amenities
  let amenitiesArray: string[] = []
  
  console.log('Amenities field:', amenitiesField)
  
  try {
    // Handle string format (JSON string)
    if (typeof amenitiesField === 'string') {
      try {
        const parsed = JSON.parse(amenitiesField || '[]')
        if (Array.isArray(parsed)) {
          amenitiesArray = parsed
        } else if (parsed && typeof parsed === 'object') {
          // Handle object with categories
          Object.values(parsed).forEach((category: any) => {
            if (Array.isArray(category)) {
              amenitiesArray = [...amenitiesArray, ...category]
            }
          })
        }
      } catch (e) {
        console.error('Error parsing amenities string:', e)
      }
    }
    // Handle array format
    else if (Array.isArray(amenitiesField)) {
      amenitiesArray = amenitiesField
    }
    // Handle object format (JSONB from PostgreSQL)
    else if (amenitiesField && typeof amenitiesField === 'object') {
      // If it's a simple object with string values
      if (Object.values(amenitiesField).some(v => typeof v === 'string')) {
        amenitiesArray = Object.values(amenitiesField) as string[]
      }
      // If it's an object with nested arrays
      else {
        Object.values(amenitiesField).forEach((category: any) => {
          if (Array.isArray(category)) {
            amenitiesArray = [...amenitiesArray, ...category]
          }
        })
      }
    }
  } catch (error) {
    console.error('Error processing amenities:', error)
  }
  
  // If no amenities were found, use default ones
  if (amenitiesArray.length === 0) {
    console.log('Using default amenities')
    amenitiesArray = DEFAULT_AMENITIES
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{spaceName}</h1>
            <p className="text-muted-foreground mt-1">{spaceLocation}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <span className="material-symbols-outlined">share</span>
            </Button>
            <Button variant="outline" size="icon">
              <span className="material-symbols-outlined">favorite</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Images and Map */}
      <div className="container mx-auto px-4 mb-8">
        <div className="grid grid-cols-4 gap-2 h-[480px]">
          {/* Main Image */}
          <div className="col-span-2 row-span-2 relative rounded-l-lg overflow-hidden">
            {images[0] && (
              <Image
                src={images[0]}
                alt={`${spaceName} main`}
                fill
                className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
              />
            )}
          </div>
          {/* Two Small Images */}
          <div className="relative overflow-hidden h-[240px]">
            {images[1] && (
              <Image
                src={images[1]}
                alt={`${spaceName} 2`}
                fill
                className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
              />
            )}
          </div>
          <div className="relative overflow-hidden rounded-tr-lg h-[240px]">
            {images[2] && (
              <Image
                src={images[2]}
                alt={`${spaceName} 3`}
                fill
                className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
              />
            )}
          </div>
          {/* Map */}
          <div className="col-span-2 relative rounded-br-lg overflow-hidden h-[240px]">
            <Map 
              location={spaceLocation} 
              className="w-full h-full"
              coordinates={coordinates} 
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Column - Info */}
          <div className="md:col-span-2">
            {/* Host Info */}
            <div className="flex items-center gap-4 pb-6 border-b">
              <Avatar className="h-12 w-12">
                <AvatarImage src={space.owner.image || ""} />
                <AvatarFallback>
                  {space.owner.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">Workspace by {space.owner.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {spaceType || "Workspace"} u00b7 Up to {spaceCapacity} people
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="py-6 border-b">
              <p className="text-muted-foreground whitespace-pre-line">
                {space.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="py-6 border-b">
              <h2 className="text-xl font-semibold mb-4">What this space offers</h2>
              <div className="grid grid-cols-2 gap-4">
                {amenitiesArray.slice(0, 10).map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">
                      {TOP_AMENITIES[index]?.icon || "check"}
                    </span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <AmenitiesDialog amenities={amenitiesArray.map((amenity, index) => ({
                  icon: TOP_AMENITIES[Math.min(index, TOP_AMENITIES.length - 1)]?.icon || "check",
                  label: amenity,
                  category: index < 5 ? "Essential" : "Additional"
                }))} />
              </div>
            </div>

            {/* Reviews */}
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              <Testimonials testimonials={testimonials.slice(0, 3)} />
            </div>
          </div>

          {/* Right Column - Booking */}
          <div>
            <div className="sticky top-6">
              <BookingForm price={spacePrice} spaceId={params.id} />
            </div>
          </div>
        </div>
      </div>
      <NewsletterCTA />
      <Footer />
    </main>
  )
}
