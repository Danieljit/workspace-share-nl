import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { Prisma, SpaceType } from "@prisma/client"
import { requireUser, apiErrorResponse, ApiError } from "@/lib/session"
import { parseJsonArray } from "@/types"

export const dynamic = "force-dynamic"

const VALID_SPACE_TYPES = new Set<string>(Object.values(SpaceType))

/** Stringify a value for a JSON column, accepting either an object/array or a pre-stringified value. */
function toJsonColumn(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === "string") return value
  return JSON.stringify(value)
}

/** Parse an optional numeric field, returning undefined for missing or non-finite values. */
function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const location = searchParams.get("location")
  const type = searchParams.get("type")

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20),
  )

  try {
    const where: Prisma.SpaceWhereInput = {}

    if (location) {
      where.OR = [
        { city: { contains: location, mode: "insensitive" } },
        { address: { contains: location, mode: "insensitive" } },
      ]
    }

    if (type && VALID_SPACE_TYPES.has(type)) {
      where.workspaceType = type as SpaceType
    }

    const [spaces, total] = await Promise.all([
      db.space.findMany({
        where,
        include: {
          owner: {
            // Public listing — do not expose owner account email.
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.space.count({ where }),
    ])

    const transformedSpaces = spaces.map((space) => ({
      id: space.id,
      name: space.title,
      description: space.description,
      location: `${space.address || ""}, ${space.city || ""}`
        .trim()
        .replace(/^,\s*/, "")
        .replace(/,\s*$/, ""),
      type: space.workspaceType,
      price: space.pricePerDay,
      amenities: parseJsonArray(space.amenities),
      images: parseJsonArray(space.photos),
      owner: {
        id: space.owner.id,
        name: space.owner.name,
        image: space.owner.image,
      },
    }))

    return NextResponse.json({
      spaces: transformedSpaces,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error("Error fetching spaces:", error)
    return NextResponse.json({ error: "Failed to fetch spaces" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser()

    const json = await req.json()

    // Validate required fields.
    const title: unknown = json.title ?? json.name
    const workspaceType: unknown = json.workspaceType ?? json.type
    const address: unknown = json.address ?? json.location
    const pricePerDayRaw: unknown = json.pricePerDay ?? json.price

    if (typeof title !== "string" || title.trim().length === 0) {
      throw new ApiError(400, "Title is required")
    }
    if (
      typeof workspaceType !== "string" ||
      !VALID_SPACE_TYPES.has(workspaceType)
    ) {
      throw new ApiError(400, "A valid workspaceType is required")
    }
    if (typeof address !== "string" || address.trim().length === 0) {
      throw new ApiError(400, "Address is required")
    }
    const pricePerDay = Number(pricePerDayRaw)
    if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
      throw new ApiError(400, "A valid pricePerDay is required")
    }

    const data: Prisma.SpaceCreateInput = {
      // Basic information
      title: title.trim(),
      description: typeof json.description === "string" ? json.description : "",
      workspaceType: workspaceType as SpaceType,

      // Location information
      address: address.trim(),
      city: typeof json.city === "string" && json.city ? json.city : "Amsterdam",
      postalCode:
        typeof json.postalCode === "string" && json.postalCode
          ? json.postalCode
          : "1000 AA",
      coordinates: toJsonColumn(json.coordinates),
      directions: json.directions ?? undefined,
      transportInfo: json.transportInfo ?? undefined,
      parkingInfo: json.parkingInfo ?? undefined,

      // Building and workspace details
      buildingContext: toJsonColumn(json.buildingContext),
      workspaceDetails: toJsonColumn(json.workspaceDetails),

      // Amenities and photos (stored as stringified arrays)
      amenities: toJsonColumn(json.amenities),
      photos: toJsonColumn(json.photos),

      // Availability
      availability: toJsonColumn(json.availability),

      // Pricing
      pricePerDay,
      pricePerThreeDays: optionalNumber(json.pricePerThreeDays),
      pricePerWeek: optionalNumber(json.pricePerWeek),
      pricePerMonth: optionalNumber(json.pricePerMonth),

      // Host information
      hostName:
        typeof json.hostName === "string" && json.hostName
          ? json.hostName
          : user.name || "Host",
      hostEmail: json.hostEmail ?? user.email ?? undefined,
      hostPhone: json.hostPhone ?? undefined,
      preferredContact: json.preferredContact ?? undefined,
      responseTime: json.responseTime ?? undefined,
      hostInfo: toJsonColumn(json.hostInfo),

      // Ownership
      owner: { connect: { id: user.id } },
    }

    const space = await db.space.create({ data })

    return NextResponse.json(space)
  } catch (error) {
    return apiErrorResponse(error)
  }
}
