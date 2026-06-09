import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ProfileSummary } from "@/types"

interface ProfileCardProps {
  profile: ProfileSummary
  /** Number of skills/interests shared with the logged-in viewer. */
  sharedCount?: number
  /** Max number of skill badges to render. */
  maxSkills?: number
}

function initials(name: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?"
}

/**
 * Reusable card showing a compact public professional profile: avatar, name,
 * headline, job @ company, top skills, city, and an optional "shared interests"
 * badge. Links through to the full profile at /people/[id].
 */
export function ProfileCard({
  profile,
  sharedCount = 0,
  maxSkills = 4,
}: ProfileCardProps) {
  const topSkills = profile.skills.slice(0, maxSkills)
  const extraSkills = profile.skills.length - topSkills.length

  const jobLine = [profile.jobTitle, profile.companyName]
    .filter(Boolean)
    .join(" @ ")

  return (
    <Link href={`/people/${profile.id}`} className="group block">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={profile.image || ""} alt={profile.name || "User"} />
              <AvatarFallback>{initials(profile.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold leading-tight">
                {profile.name || "Anonymous member"}
              </h3>
              {profile.headline && (
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                  {profile.headline}
                </p>
              )}
              {jobLine && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {jobLine}
                </p>
              )}
            </div>
          </div>

          <div className="mt-auto space-y-3">
            {sharedCount > 0 && (
              <Badge variant="secondary" className="font-medium">
                {sharedCount} shared {sharedCount === 1 ? "interest" : "interests"}
              </Badge>
            )}

            {topSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topSkills.map((skill) => (
                  <Badge key={skill} variant="outline" className="font-normal">
                    {skill}
                  </Badge>
                ))}
                {extraSkills > 0 && (
                  <Badge variant="outline" className="font-normal">
                    +{extraSkills}
                  </Badge>
                )}
              </div>
            )}

            {(profile.city || profile.industry) && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                {[profile.city, profile.industry].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
