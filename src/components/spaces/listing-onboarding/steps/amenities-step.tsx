"use client"

import { useState } from "react"
import { Check } from "lucide-react"

type AmenitiesStepProps = {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

type Amenity = {
  id: string;
  name: string;
  icon: string;
  category: "essential" | "special";
}

export function AmenitiesStep({ formData, updateFormData }: AmenitiesStepProps) {
  // Initialize selected amenities from form data or empty array
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    formData.amenities || []
  )

  // Essential amenities that most guests look for
  const essentialAmenities: Amenity[] = [
    { id: "wifi", name: "WiFi", icon: "wifi", category: "essential" },
    { id: "dedicated-workspace", name: "Dedicated Workspace", icon: "desk", category: "essential" },
    { id: "meeting-room", name: "Meeting Room", icon: "groups", category: "essential" },
    { id: "printer", name: "Printer", icon: "print", category: "essential" },
    { id: "coffee", name: "Coffee Machine", icon: "coffee", category: "essential" },
    { id: "whiteboard", name: "Whiteboard", icon: "edit_note", category: "essential" },
    { id: "ac", name: "Air Conditioning", icon: "ac_unit", category: "essential" },
    { id: "kitchen", name: "Kitchen", icon: "cooking", category: "essential" },
    { id: "free-parking", name: "Free Parking", icon: "local_parking", category: "essential" },
    { id: "paid-parking", name: "Paid Parking", icon: "payments", category: "essential" },
    { id: "phone-booth", name: "Phone Booth", icon: "phone_in_talk", category: "essential" },
    { id: "monitor", name: "External Monitor", icon: "desktop_windows", category: "essential" },
  ]

  // Special amenities that make your office space unique
  const specialAmenities: Amenity[] = [
    { id: "projector", name: "Projector", icon: "cast", category: "special" },
    { id: "sound-system", name: "Sound System", icon: "speaker", category: "special" },
    { id: "standing-desk", name: "Standing Desk", icon: "height", category: "special" },
    { id: "ergonomic-chair", name: "Ergonomic Chair", icon: "chair", category: "special" },
    { id: "bike-storage", name: "Bike Storage", icon: "pedal_bike", category: "special" },
    { id: "ev-charger", name: "EV Charging", icon: "ev_station", category: "special" },
    { id: "shower", name: "Shower", icon: "shower", category: "special" },
    { id: "lounge", name: "Lounge Area", icon: "weekend", category: "special" },
    { id: "game-room", name: "Game Room", icon: "sports_esports", category: "special" },
    { id: "gym", name: "Fitness Center", icon: "fitness_center", category: "special" },
    { id: "rooftop", name: "Rooftop Access", icon: "deck", category: "special" },
    { id: "catering", name: "Catering Options", icon: "restaurant", category: "special" },
    { id: "reception", name: "Reception Service", icon: "support_agent", category: "special" },
    { id: "mail-handling", name: "Mail Handling", icon: "mail", category: "special" },
    { id: "podcast-studio", name: "Podcast Studio", icon: "mic", category: "special" },
    { id: "video-conferencing", name: "Video Conferencing", icon: "videocam", category: "special" },
  ]

  const toggleAmenity = (amenityId: string) => {
    // First update the local state
    const newSelection = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter(id => id !== amenityId)
      : [...selectedAmenities, amenityId]
    
    // Set the local state
    setSelectedAmenities(newSelection)
    
    // Then update the form data separately, not inside the state setter
    updateFormData("amenities", newSelection)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Let guests know what your workspace offers</h2>
        <p className="text-muted-foreground">You can add more amenities after you publish your listing.</p>
      </div>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Essential amenities that guests look for</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {essentialAmenities.map((amenity) => (
              <div 
                key={amenity.id}
                onClick={() => toggleAmenity(amenity.id)}
                className={`relative flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${selectedAmenities.includes(amenity.id) ? 'border-primary border-2' : 'border-border hover:border-primary/50'}`}
              >
                {selectedAmenities.includes(amenity.id) && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className="mb-2 text-center">
                  <span className="material-symbols-outlined text-3xl">{amenity.icon}</span>
                </div>
                <span className="text-sm text-center font-medium">{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Special amenities that make your space stand out</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {specialAmenities.map((amenity) => (
              <div 
                key={amenity.id}
                onClick={() => toggleAmenity(amenity.id)}
                className={`relative flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${selectedAmenities.includes(amenity.id) ? 'border-primary border-2' : 'border-border hover:border-primary/50'}`}
              >
                {selectedAmenities.includes(amenity.id) && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className="mb-2 text-center">
                  <span className="material-symbols-outlined text-3xl">{amenity.icon}</span>
                </div>
                <span className="text-sm text-center font-medium">{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
