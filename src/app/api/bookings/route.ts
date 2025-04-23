import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { spaceId, startDate, endDate, totalPrice } = await request.json()
    
    if (!spaceId || !startDate || !endDate || !totalPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Check if the space exists
    const space = await db.space.findUnique({
      where: { id: spaceId }
    })
    
    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 })
    }
    
    // Check if the dates are available
    const existingBookings = await db.booking.findMany({
      where: {
        spaceId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) }
          }
        ]
      }
    })
    
    if (existingBookings.length > 0) {
      return NextResponse.json({ error: "Selected dates are not available" }, { status: 409 })
    }
    
    // Create the booking
    const booking = await db.booking.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice: parseFloat(totalPrice),
        status: "PENDING",
        userId: session.user.id,
        spaceId
      }
    })
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
