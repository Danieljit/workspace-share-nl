import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { SpaceType } from "@prisma/client"

const SAMPLE_SPACES = [
  {
    name: "Modern Co-working Desk",
    description: "A comfortable desk in our modern co-working space. Perfect for freelancers and remote workers.",
    type: SpaceType.DESK,
    location: "123 Main St, San Francisco, CA 94105",
    amenities: JSON.stringify({
      furniture: [
        "Ergonomic chair",
        "Adjustable desk",
        "Storage locker",
        "Desk lamp",
      ],
      technology: [
        "High-speed WiFi (1Gbps)",
        "Power outlets",
        "24\" Monitor",
        "Wireless charging",
      ],
      facilities: [
        "Kitchen access",
        "Bathroom",
        "Bike storage",
        "Shower facilities",
      ],
      refreshments: [
        "Premium coffee machine",
        "Water dispenser",
        "Snack bar",
        "Fresh fruit daily",
      ],
      services: [
        "24/7 access",
        "Mail handling",
        "Printing services",
        "Tech support",
      ],
    }),
    price: 25.0,
    capacity: 1,
    images: JSON.stringify([
      "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg",
      "https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg",
      "https://images.pexels.com/photos/1181401/pexels-photo-1181401.jpeg",
      "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg",
      "https://images.pexels.com/photos/1181435/pexels-photo-1181435.jpeg",
    ]),
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
  },
]

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

    // Create sample spaces
    const spaces = await Promise.all(
      SAMPLE_SPACES.map((space) =>
        db.space.create({
          data: {
            name: space.name,
            description: space.description,
            type: space.type,
            location: space.location,
            amenities: space.amenities,
            price: space.price,
            capacity: space.capacity,
            images: space.images,
            features: space.features,
            availability: space.availability,
            ownerId: user!.id,
          },
        })
      )
    )

    return NextResponse.json(spaces)
  } catch (error) {
    console.error("Error seeding data:", error)
    return NextResponse.json(
      { message: "Error seeding data" },
      { status: 500 }
    )
  }
}
