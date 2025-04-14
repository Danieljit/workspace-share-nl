import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { SpaceType } from "@prisma/client"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const location = searchParams.get("location")
  const type = searchParams.get("type")

  try {
    // Query without filters to avoid schema mismatch errors
    const spaces = await db.space.findMany({
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

    // Apply filters in memory instead
    let filteredSpaces = spaces
    if (location) {
      filteredSpaces = filteredSpaces.filter(space => {
        // Check both old and new schema fields
        const addressField = (space as any).address || (space as any).location || ''
        return addressField.toLowerCase().includes(location.toLowerCase())
      })
    }
    
    if (type) {
      filteredSpaces = filteredSpaces.filter(space => {
        // Check both old and new schema fields
        const typeField = (space as any).workspaceType || (space as any).type
        return typeField === type
      })
    }

    // Transform the data to match the expected format in the frontend
    const transformedSpaces = filteredSpaces.map(space => {
      // Check if we're dealing with new schema or old schema
      const isNewSchema = 'title' in space
      
      return {
        id: space.id,
        name: isNewSchema ? (space as any).title : (space as any).name,
        description: space.description,
        location: isNewSchema 
          ? `${(space as any).address || ''}, ${(space as any).city || ''}`.trim() 
          : (space as any).location || 'Unknown Location',
        type: isNewSchema ? (space as any).workspaceType : (space as any).type,
        price: isNewSchema ? (space as any).pricePerDay || 0 : (space as any).price || 0,
        amenities: space.amenities || '',
        images: isNewSchema ? (space as any).photos || '' : (space as any).images || '',
        owner: {
          id: space.owner.id,
          name: space.owner.name,
          email: space.owner.email,
          image: space.owner.image
        }
      }
    })

    return NextResponse.json(transformedSpaces)
  } catch (error) {
    console.error('Error fetching spaces:', error)
    return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  // For demonstration purposes, we'll use a mock user ID
  const mockUserId = "1"

  try {
    const json = await req.json()

    // Find an admin user to associate with the space
    let ownerId = mockUserId
    const adminUser = await db.user.findFirst({
      where: {
        email: 'admin@example.com'
      }
    })
    
    if (adminUser) {
      ownerId = adminUser.id
    }

    // Create the space with type assertion to bypass TypeScript errors
    // This is necessary because our Prisma client might not be in sync with the schema
    const space = await db.space.create({
      data: {
        // Basic information
        title: json.title || json.name || 'Unnamed Space',
        description: json.description || '',
        workspaceType: (json.workspaceType || json.type || 'DESK') as SpaceType,
        
        // Location information
        address: json.address || json.location || 'Unknown Address',
        city: json.city || 'Amsterdam',
        postalCode: json.postalCode || '1000 AA',
        coordinates: typeof json.coordinates === 'object' ? JSON.stringify(json.coordinates) : json.coordinates,
        directions: json.directions,
        transportInfo: json.transportInfo,
        parkingInfo: json.parkingInfo,
        
        // Building and workspace details
        buildingContext: typeof json.buildingContext === 'object' ? JSON.stringify(json.buildingContext) : json.buildingContext,
        workspaceDetails: typeof json.workspaceDetails === 'object' ? JSON.stringify(json.workspaceDetails) : json.workspaceDetails,
        
        // Amenities and photos
        amenities: Array.isArray(json.amenities) ? JSON.stringify(json.amenities) : json.amenities,
        photos: Array.isArray(json.photos) ? JSON.stringify(json.photos) : json.photos,
        
        // Availability
        availability: typeof json.availability === 'object' ? JSON.stringify(json.availability) : json.availability,
        
        // Pricing
        pricePerDay: Number(json.pricePerDay || json.price || 0),
        pricePerThreeDays: json.pricePerThreeDays ? Number(json.pricePerThreeDays) : undefined,
        pricePerWeek: json.pricePerWeek ? Number(json.pricePerWeek) : undefined,
        pricePerMonth: json.pricePerMonth ? Number(json.pricePerMonth) : undefined,
        
        // Host information
        hostName: json.hostName || 'Host',
        hostEmail: json.hostEmail,
        hostPhone: json.hostPhone,
        preferredContact: json.preferredContact,
        responseTime: json.responseTime,
        hostInfo: json.hostInfo,
        
        // Ownership
        ownerId: ownerId,
      } as any // Use type assertion to bypass TypeScript errors
    })

    return NextResponse.json(space)
  } catch (error) {
    console.error('Error creating space:', error)
    return NextResponse.json({ error: 'Failed to create space' }, { status: 500 })
  }
}
