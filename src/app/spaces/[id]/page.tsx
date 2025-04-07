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

export default async function SpacePage({ params }: { params: { id: string } }) {
  const space = await db.space.findUnique({
    where: { id: params.id },
    include: { owner: true },
  })

  if (!space) {
    notFound()
  }

  const images = JSON.parse(space.images || "[]") as string[]
  
  // Parse amenities and handle both array and object formats
  const parsedAmenities = JSON.parse(space.amenities || "[]") 
  
  // Convert amenities object to flat array if needed
  let amenitiesArray: string[] = []
  if (Array.isArray(parsedAmenities)) {
    amenitiesArray = parsedAmenities
  } else if (typeof parsedAmenities === 'object' && parsedAmenities !== null) {
    // Extract amenities from categories (furniture, technology, etc.)
    Object.values(parsedAmenities).forEach(category => {
      if (Array.isArray(category)) {
        amenitiesArray = [...amenitiesArray, ...category]
      }
    })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{space.name}</h1>
            <p className="text-muted-foreground mt-1">{space.location}</p>
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
                alt={`${space.name} main`}
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
                alt={`${space.name} 2`}
                fill
                className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
              />
            )}
          </div>
          <div className="relative overflow-hidden rounded-tr-lg h-[240px]">
            {images[2] && (
              <Image
                src={images[2]}
                alt={`${space.name} 3`}
                fill
                className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
              />
            )}
          </div>
          {/* Map */}
          <div className="col-span-2 relative rounded-br-lg overflow-hidden h-[240px]">
            <Map location={space.location} className="w-full h-full" />
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
                  {space.type || "Workspace"} · Up to {space.capacity} people
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
              <AmenitiesDialog amenities={amenitiesArray.map((amenity, index) => ({
                icon: TOP_AMENITIES[index]?.icon || "check",
                label: amenity,
                category: index < 5 ? "Essential" : "Additional"
              }))} />
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
              <BookingForm price={space.price} />
            </div>
          </div>
        </div>
      </div>
      <NewsletterCTA />
      <Footer />
    </main>
  )
}
