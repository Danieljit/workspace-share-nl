import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get("spaceId")

    if (!spaceId) {
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 })
    }

    // Find the space in the database
    const space = await db.space.findUnique({
      where: { id: spaceId },
      select: {
        availability: true,
        bookings: {
          where: {
            status: { in: ["PENDING", "CONFIRMED"] },
            endDate: { gte: new Date() }
          },
          select: {
            startDate: true,
            endDate: true
          }
        }
      }
    })

    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 })
    }

    // Parse the availability data from the space
    let availabilityData = {}
    if (space.availability) {
      try {
        if (typeof space.availability === "string") {
          availabilityData = JSON.parse(space.availability)
        } else if (typeof space.availability === "object") {
          availabilityData = space.availability
        }
      } catch (error) {
        console.error("Error parsing availability data:", error)
      }
    }

    // Get the unavailable dates from existing bookings
    const unavailableDates: string[] = []
    
    // Add dates from existing bookings
    space.bookings.forEach(booking => {
      const start = new Date(booking.startDate)
      const end = new Date(booking.endDate)
      
      // Add all dates between start and end (inclusive)
      const currentDate = new Date(start)
      while (currentDate <= end) {
        unavailableDates.push(currentDate.toISOString().split('T')[0])
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })
    
    return NextResponse.json({
      availability: availabilityData,
      unavailableDates: unavailableDates
    })
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
