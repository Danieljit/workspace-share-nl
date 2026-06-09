import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getSessionUser } from "@/lib/session"
import { computeMatch } from "@/lib/matching"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const dynamic = "force-dynamic"

interface ProfilePageProps {
  params: { id: string }
}

function initials(name: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?"
}

function TagSection({ title, tags, highlight }: { title: string; tags: string[]; highlight?: Set<string> }) {
  if (tags.length === 0) return null
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isShared = highlight?.has(tag.trim().toLowerCase())
          return (
            <Badge
              key={tag}
              variant={isShared ? "secondary" : "outline"}
              className="font-normal"
            >
              {tag}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const viewer = await getSessionUser()

  const user = await db.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      image: true,
      headline: true,
      bio: true,
      jobTitle: true,
      companyName: true,
      industry: true,
      city: true,
      skills: true,
      interests: true,
      lookingFor: true,
      languages: true,
      websiteUrl: true,
      linkedinUrl: true,
      profileVisibility: true,
    },
  })

  if (!user) {
    notFound()
  }

  const isOwnProfile = viewer?.id === user.id

  // Respect visibility: private profiles are only visible to their owner.
  if (user.profileVisibility !== "PUBLIC" && !isOwnProfile) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">This profile is private</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            This member has chosen not to share their profile publicly.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/people">Back to directory</Link>
          </Button>
        </div>
      </main>
    )
  }

  // Compute shared skills/interests for the logged-in viewer (not for self).
  let viewerProfile: { skills: string[]; interests: string[] } | null = null
  if (viewer && !isOwnProfile) {
    viewerProfile = await db.user.findUnique({
      where: { id: viewer.id },
      select: { skills: true, interests: true },
    })
  }
  const match = computeMatch(viewerProfile, {
    skills: user.skills,
    interests: user.interests,
  })
  const sharedSkillSet = new Set(match.sharedSkills.map((s) => s.toLowerCase()))
  const sharedInterestSet = new Set(
    match.sharedInterests.map((s) => s.toLowerCase()),
  )

  const jobLine = [user.jobTitle, user.companyName].filter(Boolean).join(" @ ")

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/people"
          className="mb-6 inline-block text-sm text-muted-foreground hover:underline"
        >
          ← Back to directory
        </Link>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                <AvatarFallback className="text-2xl">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold">
                    {user.name || "Anonymous member"}
                  </h1>
                  {match.score > 0 && (
                    <Badge variant="secondary">
                      {match.score} shared{" "}
                      {match.score === 1 ? "interest" : "interests"}
                    </Badge>
                  )}
                  {isOwnProfile && (
                    <Badge variant="outline">Your profile</Badge>
                  )}
                </div>
                {user.headline && (
                  <p className="mt-1 text-lg text-muted-foreground">
                    {user.headline}
                  </p>
                )}
                {jobLine && (
                  <p className="mt-1 text-sm text-muted-foreground">{jobLine}</p>
                )}
                <p className="mt-2 flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                  {[user.city, user.industry].filter(Boolean).join(" · ")}
                </p>
                {(user.websiteUrl || user.linkedinUrl) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.websiteUrl && (
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={user.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Website
                        </a>
                      </Button>
                    )}
                    {user.linkedinUrl && (
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={user.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {user.bio && (
              <>
                <Separator className="my-6" />
                <div>
                  <h2 className="mb-2 text-lg font-semibold">About</h2>
                  <p className="whitespace-pre-line text-muted-foreground">
                    {user.bio}
                  </p>
                </div>
              </>
            )}

            {user.lookingFor && (
              <>
                <Separator className="my-6" />
                <div>
                  <h2 className="mb-2 text-lg font-semibold">Looking for</h2>
                  <p className="whitespace-pre-line text-muted-foreground">
                    {user.lookingFor}
                  </p>
                </div>
              </>
            )}

            {(user.skills.length > 0 ||
              user.interests.length > 0 ||
              user.languages.length > 0) && (
              <>
                <Separator className="my-6" />
                <div className="space-y-6">
                  <TagSection
                    title="Skills"
                    tags={user.skills}
                    highlight={sharedSkillSet}
                  />
                  <TagSection
                    title="Interests"
                    tags={user.interests}
                    highlight={sharedInterestSet}
                  />
                  <TagSection title="Languages" tags={user.languages} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
