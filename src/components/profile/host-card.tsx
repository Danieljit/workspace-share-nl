import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ProfileSummary } from "@/types"

interface HostCardProps {
  host: ProfileSummary
}

function initials(name: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?"
}

/**
 * "Hosted by" card for the space detail page. Surfaces the owner's public
 * profile summary and links to their full profile. Only render this when the
 * owner's profile is PUBLIC (the caller is responsible for that check).
 */
export function HostCard({ host }: HostCardProps) {
  const topSkills = host.skills.slice(0, 4)
  const jobLine = [host.jobTitle, host.companyName].filter(Boolean).join(" @ ")

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Hosted by</h2>
        <Link href={`/people/${host.id}`} className="group flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={host.image || ""} alt={host.name || "Host"} />
            <AvatarFallback>{initials(host.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold group-hover:underline">
              {host.name || "Host"}
            </h3>
            {host.headline && (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {host.headline}
              </p>
            )}
            {jobLine && (
              <p className="mt-1 text-xs text-muted-foreground">{jobLine}</p>
            )}
            {topSkills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {topSkills.map((skill) => (
                  <Badge key={skill} variant="outline" className="font-normal">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
