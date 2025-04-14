import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { SpaceType } from "@prisma/client"

const SAMPLE_SPACES = [
  {
    name: "Modern Co-working Desk",
    description: "A comfortable desk in our modern co-working space. Perfect for freelancers and remote workers.",
    type: SpaceType.DESK,
    location: "Herengracht 182, Amsterdam, Netherlands",
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
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
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
  {
    name: "Executive Private Office",
    description: "Luxurious private office with stunning canal views. Perfect for executives and small teams.",
    type: SpaceType.OFFICE,
    location: "Keizersgracht 123, Amsterdam, Netherlands",
    amenities: JSON.stringify({
      furniture: [
        "Executive desk",
        "Leather chair",
        "Meeting table",
        "Bookshelf",
      ],
      technology: [
        "Dedicated fiber internet",
        "Smart TV",
        "Video conferencing",
        "Wireless printer",
      ],
      facilities: [
        "Private bathroom",
        "Kitchenette",
        "Secure storage",
        "Parking space",
      ],
      refreshments: [
        "Espresso machine",
        "Mini fridge",
        "Premium tea selection",
        "Catering options",
      ],
      services: [
        "Reception services",
        "Cleaning service",
        "IT support",
        "Concierge",
      ],
    }),
    price: 95.0,
    capacity: 4,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ]),
    features: JSON.stringify({
      "Access Hours": "24/7",
      "Minimum Booking": "1 week",
      "Notice Period": "1 week",
      "Cancellation Policy": "72 hours notice",
    }),
    availability: JSON.stringify([
      {
        date: new Date().toISOString().split("T")[0],
        slots: [
          { start: "09:00", end: "17:00" },
        ],
      },
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        slots: [
          { start: "09:00", end: "17:00" },
        ],
      },
    ]),
  },
  {
    name: "Creative Meeting Room",
    description: "Bright and inspiring meeting room with whiteboard walls and flexible seating. Ideal for brainstorming and workshops.",
    type: SpaceType.MEETING_ROOM,
    location: "Prinsengracht 456, Amsterdam, Netherlands",
    amenities: JSON.stringify({
      furniture: [
        "Modular tables",
        "Ergonomic chairs",
        "Whiteboard walls",
        "Beanbags",
      ],
      technology: [
        "4K projector",
        "Surround sound",
        "Digital whiteboard",
        "Charging stations",
      ],
      facilities: [
        "Breakout area",
        "Restrooms",
        "Coat check",
        "Outdoor terrace",
      ],
      refreshments: [
        "Coffee bar",
        "Water service",
        "Snack selection",
        "Lunch options",
      ],
      services: [
        "Meeting facilitator",
        "Technical assistance",
        "Catering coordination",
        "Recording services",
      ],
    }),
    price: 65.0,
    capacity: 12,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ]),
    features: JSON.stringify({
      "Access Hours": "8:00 - 20:00",
      "Minimum Booking": "2 hours",
      "Notice Period": "24 hours",
      "Cancellation Policy": "48 hours notice",
    }),
    availability: JSON.stringify([
      {
        date: new Date().toISOString().split("T")[0],
        slots: [
          { start: "09:00", end: "12:00" },
          { start: "13:00", end: "17:00" },
        ],
      },
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        slots: [
          { start: "09:00", end: "12:00" },
          { start: "13:00", end: "17:00" },
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
