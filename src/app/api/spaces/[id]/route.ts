import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { Prisma, SpaceType } from "@prisma/client"
import { requireUser, requireSpaceOwner, apiErrorResponse } from "@/lib/session"

export const dynamic = "force-dynamic"

const VALID_SPACE_TYPES = new Set<string>(Object.values(SpaceType))

/** Stringify a value for a JSON column, accepting either an object/array or a pre-stringified value. */
function toJsonColumn(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === "string") return value
  return JSON.stringify(value)
}

/** Parse a numeric field, returning the fallback for missing or non-finite values. */
function numberOr(value: unknown, fallback: number | null): number | null {
  if (value === undefined || value === null || value === "") return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

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
            image: true,
          },
        },
      },
    })

    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 })
    }

    return NextResponse.json(space)
  } catch (error) {
    console.error("Error fetching space:", error)
    return NextResponse.json({ error: "Failed to fetch space" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const existingSpace = await requireSpaceOwner(params.id, user.id)

    const json = await req.json()

    const data: Prisma.SpaceUpdateInput = {
      // Basic information
      title: json.title || json.name || existingSpace.title,
      description: json.description || existingSpace.description,
      workspaceType:
        typeof json.workspaceType === "string" &&
        VALID_SPACE_TYPES.has(json.workspaceType)
          ? (json.workspaceType as SpaceType)
          : existingSpace.workspaceType,

      // Location information
      address: json.address || existingSpace.address,
      city: json.city || existingSpace.city,
      postalCode: json.postalCode || existingSpace.postalCode,
      coordinates: toJsonColumn(json.coordinates) ?? existingSpace.coordinates ?? Prisma.JsonNull,
      directions: json.directions ?? existingSpace.directions,
      transportInfo: json.transportInfo ?? existingSpace.transportInfo,
      parkingInfo: json.parkingInfo ?? existingSpace.parkingInfo,

      // Building and workspace details
      buildingContext:
        toJsonColumn(json.buildingContext) ?? existingSpace.buildingContext ?? Prisma.JsonNull,
      workspaceDetails:
        toJsonColumn(json.workspaceDetails) ?? existingSpace.workspaceDetails ?? Prisma.JsonNull,

      // Amenities and photos
      amenities: toJsonColumn(json.amenities) ?? existingSpace.amenities ?? Prisma.JsonNull,
      photos: toJsonColumn(json.photos) ?? existingSpace.photos ?? Prisma.JsonNull,

      // Availability
      availability:
        toJsonColumn(json.availability) ?? existingSpace.availability ?? Prisma.JsonNull,

      // Pricing
      pricePerDay: numberOr(json.pricePerDay, existingSpace.pricePerDay) ?? existingSpace.pricePerDay,
      pricePerThreeDays: numberOr(json.pricePerThreeDays, existingSpace.pricePerThreeDays),
      pricePerWeek: numberOr(json.pricePerWeek, existingSpace.pricePerWeek),
      pricePerMonth: numberOr(json.pricePerMonth, existingSpace.pricePerMonth),

      // Host information
      hostName: json.hostName || existingSpace.hostName,
      hostEmail: json.hostEmail ?? existingSpace.hostEmail,
      hostPhone: json.hostPhone ?? existingSpace.hostPhone,
      preferredContact: json.preferredContact ?? existingSpace.preferredContact,
      responseTime: json.responseTime ?? existingSpace.responseTime,
      hostInfo: toJsonColumn(json.hostInfo) ?? existingSpace.hostInfo,
    }

    const updatedSpace = await db.space.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(updatedSpace)
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    await requireSpaceOwner(params.id, user.id)

    await db.space.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Space deleted successfully" })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
