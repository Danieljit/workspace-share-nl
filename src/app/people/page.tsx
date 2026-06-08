import { Suspense } from "react"
import type { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { getSessionUser } from "@/lib/session"
import { computeMatch } from "@/lib/matching"
import { ProfileCard } from "@/components/profile/profile-card"
import { PeopleFilters } from "@/components/profile/people-filters"
import { Separator } from "@/components/ui/separator"
import type { ProfileSummary } from "@/types"

export const dynamic = "force-dynamic"

interface PeoplePageProps {
  searchParams: {
    q?: string
    city?: string
    industry?: string
  }
}

/** Selects only the public-safe profile fields plus arrays used for matching. */
const profileSelect = {
  id: true,
  name: true,
  image: true,
  headline: true,
  jobTitle: true,
  companyName: true,
  industry: true,
  city: true,
  skills: true,
  interests: true,
} satisfies Prisma.UserSelect

function toSummary(user: {
  id: string
  name: string | null
  image: string | null
  headline: string | null
  jobTitle: string | null
  companyName: string | null
  industry: string | null
  city: string | null
  skills: string[]
  interests: string[]
}): ProfileSummary {
  return user
}

export default async function PeopleDirectoryPage({
  searchParams,
}: PeoplePageProps) {
  const q = searchParams.q?.trim()
  const city = searchParams.city?.trim()
  const industry = searchParams.industry?.trim()

  const viewer = await getSessionUser()

  // Base filter: only PUBLIC profiles are ever exposed in the directory.
  const where: Prisma.UserWhereInput = { profileVisibility: "PUBLIC" }
  const and: Prisma.UserWhereInput[] = []

  if (q) {
    // Free-text search across array fields (skills/interests) and free text
    // fields (headline/job/company). Postgres arrays support `has` (case-
    // sensitive), so we also OR in case/substring matches on text columns.
    and.push({
      OR: [
        { skills: { has: q } },
        { interests: { has: q } },
        { headline: { contains: q, mode: "insensitive" } },
        { jobTitle: { contains: q, mode: "insensitive" } },
        { companyName: { contains: q, mode: "insensitive" } },
      ],
    })
  }
  if (city) {
    and.push({ city: { contains: city, mode: "insensitive" } })
  }
  if (industry) {
    and.push({ industry: { equals: industry, mode: "insensitive" } })
  }
  if (and.length > 0) {
    where.AND = and
  }

  const [users, distinctIndustries] = await Promise.all([
    db.user.findMany({
      where,
      select: profileSelect,
      orderBy: { name: "asc" },
      take: 100,
    }),
    db.user.findMany({
      where: { profileVisibility: "PUBLIC", industry: { not: null } },
      select: { industry: true },
      distinct: ["industry"],
      orderBy: { industry: "asc" },
    }),
  ])

  const industries = distinctIndustries
    .map((u) => u.industry)
    .filter((v): v is string => Boolean(v))

  // Lightweight matching: rank cards the viewer has the most in common with.
  const viewerMatch =
    viewer && users.some((u) => u.id === viewer.id)
      ? users.find((u) => u.id === viewer.id)
      : viewer
        ? await db.user.findUnique({
            where: { id: viewer.id },
            select: { skills: true, interests: true },
          })
        : null

  const enriched = users
    .filter((u) => u.id !== viewer?.id)
    .map((user) => {
      const match = computeMatch(
        viewerMatch
          ? { skills: viewerMatch.skills, interests: viewerMatch.interests }
          : null,
        { skills: user.skills, interests: user.interests },
      )
      return { profile: toSummary(user), sharedCount: match.score }
    })

  const similarPeople = [...enriched]
    .filter((e) => e.sharedCount > 0)
    .sort((a, b) => b.sharedCount - a.sharedCount)
    .slice(0, 4)

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-2">
          <h1 className="text-3xl font-bold">Discover people</h1>
          <p className="mt-1 text-muted-foreground">
            Connect with members who share your skills and interests.
          </p>
        </div>

        <div className="my-6">
          <Suspense fallback={<div className="h-10" />}>
            <PeopleFilters industries={industries} />
          </Suspense>
        </div>

        {similarPeople.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold">
              People with similar interests
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {similarPeople.map(({ profile, sharedCount }) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  sharedCount={sharedCount}
                />
              ))}
            </div>
            <Separator className="mt-10" />
          </section>
        )}

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            {enriched.length} {enriched.length === 1 ? "person" : "people"}
          </h2>
          {enriched.length === 0 ? (
            <p className="text-muted-foreground">
              No public profiles match your filters yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {enriched.map(({ profile, sharedCount }) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  sharedCount={sharedCount}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
