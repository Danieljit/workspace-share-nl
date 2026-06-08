"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, ChevronLeft, ChevronRight, Star, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ExploreListing {
  id: string
  title: string
  city: string | null
  address: string | null
  pricePerDay: number
  workspaceType: string
  photos: string[]
  rating: number | null
  reviewCount: number
}

const TYPE_LABELS: Record<string, string> = {
  DESK: "Desk",
  OFFICE: "Private office",
  MEETING_ROOM: "Meeting room",
  EVENT_SPACE: "Event space",
}

export function ListingCard({ listing }: { listing: ExploreListing }) {
  const [index, setIndex] = useState(0)
  const [liked, setLiked] = useState(false)

  const photos = listing.photos.length > 0 ? listing.photos : []
  const hasMultiple = photos.length > 1

  const go = (e: React.MouseEvent, dir: 1 | -1) => {
    e.preventDefault()
    e.stopPropagation()
    setIndex((prev) => (prev + dir + photos.length) % photos.length)
  }

  return (
    <Link href={`/spaces/${listing.id}`} className="group block">
      {/* Image / carousel */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        {photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photos[index]}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-50 to-slate-100">
            <Building2 className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}

        {/* Wishlist heart */}
        <button
          type="button"
          aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setLiked((v) => !v)
          }}
          className="absolute right-3 top-3 transition-transform hover:scale-110 active:scale-95"
        >
          <Heart
            className={cn(
              "h-6 w-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
              liked ? "fill-rose-500 text-rose-500" : "fill-black/40 text-white",
            )}
          />
        </button>

        {/* Carousel controls (hover, desktop) */}
        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => go(e, -1)}
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-1.5 opacity-0 shadow transition group-hover:opacity-100 hover:scale-105 md:block"
            >
              <ChevronLeft className="h-4 w-4 text-gray-800" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => go(e, 1)}
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-1.5 opacity-0 shadow transition group-hover:opacity-100 hover:scale-105 md:block"
            >
              <ChevronRight className="h-4 w-4 text-gray-800" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
              {photos.slice(0, 5).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full bg-white transition",
                    i === Math.min(index, 4) ? "opacity-100" : "opacity-60",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="mt-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-medium text-[15px] text-foreground">
            {listing.city ?? listing.title}
          </h3>
          {listing.rating !== null && (
            <span className="flex shrink-0 items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-current" />
              {listing.rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="truncate text-sm text-muted-foreground">{listing.title}</p>
        <p className="text-sm text-muted-foreground">
          {TYPE_LABELS[listing.workspaceType] ?? "Workspace"}
        </p>
        <p className="mt-1 text-[15px] text-foreground">
          <span className="font-semibold">€{Math.round(listing.pricePerDay)}</span> day
        </p>
      </div>
    </Link>
  )
}
