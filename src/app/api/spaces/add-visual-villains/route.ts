import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { SpaceType } from "@prisma/client"

export async function GET() {
  try {
    // Get or create a test user
    let user = await db.user.findFirst({
      where: { email: "test@example.com" },
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email: "test@example.com",
          name: "Test User",
        },
      })
    }

    // Create Visual Villains workspace in Enschede
    const visualVillainsSpace = await db.space.create({
      data: {
        name: "Visual Villains Workspace",
        description: "A creative desk space in the heart of Enschede at Connect-U, a collaborative building housing various companies across different disciplines. Perfect for designers, developers, and creative professionals looking for inspiration in a dynamic environment.",
        type: SpaceType.DESK,
        location: "Ariënsplein 1, 7511 JX Enschede, Netherlands",
        amenities: JSON.stringify({
          furniture: [
            "Ergonomic chair",
            "Spacious desk",
            "Storage space",
            "Adjustable lighting",
          ],
          technology: [
            "High-speed fiber internet (500Mbps)",
            "Multiple power outlets",
            "Dual monitor setup available",
            "Wireless printing",
          ],
          facilities: [
            "Shared kitchen",
            "Modern bathrooms",
            "Bike parking",
            "Lounge area",
          ],
          refreshments: [
            "Specialty coffee",
            "Tea selection",
            "Filtered water",
            "Weekly Friday afternoon drinks",
          ],
          services: [
            "Reception services",
            "Mail handling",
            "Meeting room access",
            "Community events",
          ],
        }),
        price: 22.5,
        capacity: 1,
        images: JSON.stringify([
          "https://images.pexels.com/photos/7070/space-desk-workspace-coworking.jpg",
          "https://images.pexels.com/photos/2041627/pexels-photo-2041627.jpeg",
          "https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg",
          "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg",
        ]),
        features: JSON.stringify({
          "Access Hours": "8:00 - 20:00, Monday to Friday",
          "Minimum Booking": "1 day",
          "Notice Period": "24 hours",
          "Cancellation Policy": "48 hours notice for full refund",
          "Location Highlights": "Central in Enschede, 5 min walk to public transport",
          "Building": "Connect-U, a multi-disciplinary creative hub",
        }),
        availability: JSON.stringify([
          {
            date: new Date().toISOString().split("T")[0],
            slots: [
              { start: "08:00", end: "12:00" },
              { start: "12:00", end: "16:00" },
              { start: "16:00", end: "20:00" },
            ],
          },
          {
            date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            slots: [
              { start: "08:00", end: "12:00" },
              { start: "12:00", end: "16:00" },
              { start: "16:00", end: "20:00" },
            ],
          },
        ]),
        ownerId: user!.id,
      },
    })

    return NextResponse.json(visualVillainsSpace)
  } catch (error) {
    console.error("Error adding Visual Villains space:", error)
    return NextResponse.json(
      { message: "Error adding Visual Villains space", error },
      { status: 500 }
    )
  }
}
