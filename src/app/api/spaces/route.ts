import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { SpaceType } from "@prisma/client"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const location = searchParams.get("location")
  const type = searchParams.get("type") as SpaceType | null

  const spaces = await db.space.findMany({
    where: {
      ...(location ? { location: { contains: location } } : {}),
      ...(type ? { type } : {}),
    },
    include: {
      owner: true,
    },
  })
  return NextResponse.json(spaces)
}

export async function POST(req: Request) {
  // For demonstration purposes, we'll use a mock user ID
  const mockUserId = "1"

  const json = await req.json()

  const space = await db.space.create({
    data: {
      ...json,
      ownerId: mockUserId,
    },
  })

  return NextResponse.json(space)
}
