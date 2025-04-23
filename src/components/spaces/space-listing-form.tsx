"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SpaceType } from "@prisma/client"

const PLACEHOLDER_IMAGES = [
  "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg",
  "https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg",
  "https://images.pexels.com/photos/1181401/pexels-photo-1181401.jpeg",
  "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg",
  "https://images.pexels.com/photos/1181435/pexels-photo-1181435.jpeg",
]

const PLACEHOLDER_FLOORPLAN = "https://images.pexels.com/photos/271667/pexels-photo-271667.jpeg"

const DEFAULT_AMENITIES = {
  furniture: [
    "Ergonomic chair",
    "Adjustable desk",
    "Storage cabinet",
    "Whiteboard",
  ],
  technology: [
    "High-speed WiFi",
    "Power outlets",
    "Monitor",
    "Printer access",
  ],
  facilities: [
    "Kitchen access",
    "Bathroom",
    "Parking",
    "Bike storage",
  ],
  refreshments: [
    "Coffee machine",
    "Water dispenser",
    "Snack bar",
  ],
  services: [
    "Reception",
    "Mail handling",
    "Cleaning service",
    "24/7 access",
  ],
}

export function SpaceListingForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as SpaceType,
      location: formData.get("location") as string,
      amenities: JSON.stringify(DEFAULT_AMENITIES),
      price: parseFloat(formData.get("price") as string),
      capacity: parseInt(formData.get("capacity") as string),
      images: JSON.stringify(PLACEHOLDER_IMAGES),
      floorPlan: PLACEHOLDER_FLOORPLAN,
      features: JSON.stringify({
        "Access Hours": "24/7",
        "Minimum Booking": "1 day",
        "Notice Period": "24 hours",
        "Cancellation Policy": "48 hours notice",
      }),
      availability: JSON.stringify([
        {
          date: new Date().toISOString().split("T")[0],
          slots: [
            { start: "09:00", end: "17:00" },
            { start: "17:00", end: "22:00" },
          ],
        },
        {
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          slots: [
            { start: "09:00", end: "17:00" },
            { start: "17:00", end: "22:00" },
          ],
        },
      ]),
    }

    try {
      const response = await fetch("/api/spaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      router.push("/spaces")
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Input
            id="name"
            name="name"
            placeholder="Space Name"
            disabled={isLoading}
            required
          />
          <Textarea
            id="description"
            name="description"
            placeholder="Description"
            className="min-h-[100px]"
            disabled={isLoading}
            required
          />
          <select
            id="type"
            name="type"
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
            required
          >
            <option value="">Select Type</option>
            <option value="SINGLE_DESK">Single Desk</option>
            <option value="PRIVATE_OFFICE">Private Office</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="CO_WORKING">Co-Working Space</option>
          </select>
          <Input
            id="location"
            name="location"
            placeholder="Location"
            disabled={isLoading}
            required
          />
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            placeholder="Price per day"
            disabled={isLoading}
            required
          />
          <Input
            id="capacity"
            name="capacity"
            type="number"
            placeholder="Capacity"
            disabled={isLoading}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <Button disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Listing"}
        </Button>
      </div>
    </form>
  )
}
