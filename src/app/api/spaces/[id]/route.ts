import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { SpaceType } from "@prisma/client"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const space = await db.space.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
      },
    })

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    return NextResponse.json(space)
  } catch (error) {
    console.error('Error fetching space:', error)
    return NextResponse.json({ error: 'Failed to fetch space' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const json = await req.json()

    // Find the space first to make sure it exists
    const existingSpace = await db.space.findUnique({
      where: { id: params.id },
    })

    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // Update the space with type assertion to bypass TypeScript errors
    const updatedSpace = await db.space.update({
      where: { id: params.id },
      data: {
        // Basic information
        title: json.title || json.name || existingSpace.title,
        description: json.description || existingSpace.description,
        workspaceType: (json.workspaceType || existingSpace.workspaceType) as SpaceType,
        
        // Location information
        address: json.address || existingSpace.address,
        city: json.city || existingSpace.city,
        postalCode: json.postalCode || existingSpace.postalCode,
        coordinates: typeof json.coordinates === 'object' ? JSON.stringify(json.coordinates) : json.coordinates || existingSpace.coordinates,
        directions: json.directions || existingSpace.directions,
        transportInfo: json.transportInfo || existingSpace.transportInfo,
        parkingInfo: json.parkingInfo || existingSpace.parkingInfo,
        
        // Building and workspace details
        buildingContext: typeof json.buildingContext === 'object' ? JSON.stringify(json.buildingContext) : json.buildingContext || existingSpace.buildingContext,
        workspaceDetails: typeof json.workspaceDetails === 'object' ? JSON.stringify(json.workspaceDetails) : json.workspaceDetails || existingSpace.workspaceDetails,
        
        // Amenities and photos
        amenities: Array.isArray(json.amenities) ? JSON.stringify(json.amenities) : json.amenities || existingSpace.amenities,
        photos: Array.isArray(json.photos) ? JSON.stringify(json.photos) : json.photos || existingSpace.photos,
        
        // Availability
        availability: typeof json.availability === 'object' ? JSON.stringify(json.availability) : json.availability || existingSpace.availability,
        
        // Pricing
        pricePerDay: json.pricePerDay ? Number(json.pricePerDay) : existingSpace.pricePerDay,
        pricePerThreeDays: json.pricePerThreeDays ? Number(json.pricePerThreeDays) : existingSpace.pricePerThreeDays,
        pricePerWeek: json.pricePerWeek ? Number(json.pricePerWeek) : existingSpace.pricePerWeek,
        pricePerMonth: json.pricePerMonth ? Number(json.pricePerMonth) : existingSpace.pricePerMonth,
        
        // Host information
        hostName: json.hostName || existingSpace.hostName,
        hostEmail: json.hostEmail || existingSpace.hostEmail,
        hostPhone: json.hostPhone || existingSpace.hostPhone,
        preferredContact: json.preferredContact || existingSpace.preferredContact,
        responseTime: json.responseTime || existingSpace.responseTime,
        hostInfo: json.hostInfo || existingSpace.hostInfo,
      } as any // Use type assertion to bypass TypeScript errors
    })

    return NextResponse.json(updatedSpace)
  } catch (error) {
    console.error('Error updating space:', error)
    return NextResponse.json({ error: 'Failed to update space' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Find the space first to make sure it exists
    const existingSpace = await db.space.findUnique({
      where: { id: params.id },
    })

    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // Delete the space
    await db.space.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Space deleted successfully' })
  } catch (error) {
    console.error('Error deleting space:', error)
    return NextResponse.json({ error: 'Failed to delete space' }, { status: 500 })
  }
}
