import { db } from "@/lib/db"
import { parseJsonArray } from "@/types"
import { ExplorePage } from "@/components/explore/explore-page"
import type { ExploreListing } from "@/components/explore/listing-card"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Explore workspaces · The Red Stapler",
  description: "Browse and book workspaces near you.",
}

export default async function ExploreRoute() {
  const spaces = await db.space.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { reviews: { select: { rating: true } } },
  })

  const listings: ExploreListing[] = spaces.map((space) => {
    const ratings = space.reviews.map((r) => r.rating)
    const rating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : null

    return {
      id: space.id,
      title: space.title,
      city: space.city,
      address: space.address,
      pricePerDay: space.pricePerDay,
      workspaceType: space.workspaceType,
      photos: parseJsonArray(space.photos),
      rating,
      reviewCount: ratings.length,
    }
  })

  return <ExplorePage listings={listings} />
}
