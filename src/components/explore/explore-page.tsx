"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  Globe,
  Menu,
  LayoutGrid,
  Armchair,
  DoorClosed,
  Users,
  PartyPopper,
  MapPin,
} from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { StaplerIcon } from "@/components/ui/stapler-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { CategoryBar, type Category } from "./category-bar"
import { ListingCard, type ExploreListing } from "./listing-card"

const TYPE_CATEGORIES: { type: string; label: string; icon: Category["icon"] }[] = [
  { type: "DESK", label: "Desks", icon: Armchair },
  { type: "OFFICE", label: "Private offices", icon: DoorClosed },
  { type: "MEETING_ROOM", label: "Meeting rooms", icon: Users },
  { type: "EVENT_SPACE", label: "Event spaces", icon: PartyPopper },
]

export function ExplorePage({ listings }: { listings: ExploreListing[] }) {
  const [active, setActive] = useState("all")
  const [query, setQuery] = useState("")

  // Build the category row from the data: All -> available types -> top cities.
  const categories = useMemo<Category[]>(() => {
    const presentTypes = new Set(listings.map((l) => l.workspaceType))
    const typeCats = TYPE_CATEGORIES.filter((t) => presentTypes.has(t.type)).map((t) => ({
      key: `type:${t.type}`,
      label: t.label,
      icon: t.icon,
    }))

    const cityCounts = new Map<string, number>()
    for (const l of listings) {
      if (l.city) cityCounts.set(l.city, (cityCounts.get(l.city) ?? 0) + 1)
    }
    const cityCats = Array.from(cityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([city]) => ({ key: `city:${city}`, label: city, icon: MapPin }))

    return [{ key: "all", label: "All", icon: LayoutGrid }, ...typeCats, ...cityCats]
  }, [listings])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return listings.filter((l) => {
      if (active.startsWith("type:") && l.workspaceType !== active.slice(5)) return false
      if (active.startsWith("city:") && l.city !== active.slice(5)) return false
      if (q) {
        const haystack = `${l.title} ${l.city ?? ""} ${l.address ?? ""}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [listings, active, query])

  return (
    <div className="min-h-screen bg-background">
      <Header query={query} setQuery={setQuery} />

      {/* Category bar */}
      <div className="sticky top-[80px] z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-[2080px] px-6 pt-3 lg:px-10">
          <CategoryBar categories={categories} active={active} onChange={setActive} />
        </div>
      </div>

      {/* Grid */}
      <main className="mx-auto max-w-[2080px] px-6 py-6 lg:px-10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-lg font-medium">No workspaces found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different category or search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function Header({
  query,
  setQuery,
}: {
  query: string
  setQuery: (v: string) => void
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-20 max-w-[2080px] items-center justify-between gap-4 px-6 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <StaplerIcon className="text-rose-600" size={30} />
          <span className="hidden text-xl text-[#ee5d5d] md:inline">The Red Stapler</span>
        </Link>

        {/* Search pill */}
        <div className="flex flex-1 justify-center">
          <div className="flex w-full max-w-md items-center rounded-full border bg-background shadow-sm transition-shadow hover:shadow-md">
            <div className="flex flex-1 items-center pl-5">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search workspaces"
                className="w-full bg-transparent py-2.5 text-sm font-medium outline-none placeholder:text-muted-foreground"
              />
            </div>
            <span className="hidden h-6 w-px bg-border sm:block" />
            <span className="hidden px-4 text-sm text-muted-foreground sm:block">Any week</span>
            <span className="hidden h-6 w-px bg-border sm:block" />
            <span className="hidden px-4 text-sm text-muted-foreground md:block">Add dates</span>
            <button
              type="button"
              aria-label="Search"
              className="m-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white transition-colors hover:bg-rose-600"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/spaces/list"
            className="hidden rounded-full px-4 py-2.5 text-sm font-medium hover:bg-accent lg:block"
          >
            List your space
          </Link>
          <button
            type="button"
            aria-label="Language"
            className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-accent md:flex"
          >
            <Globe className="h-4 w-4" />
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

function UserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border py-1.5 pl-3 pr-1.5 shadow-sm transition-shadow hover:shadow-md"
      >
        <Menu className="h-4 w-4" />
        <Avatar className="h-7 w-7">
          {user?.image ? <AvatarImage src={user.image} alt={user.name ?? "User"} /> : null}
          <AvatarFallback className="bg-rose-500 text-xs text-white">
            {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border bg-background py-2 shadow-xl">
          {user ? (
            <>
              <MenuItem href="/dashboard" label="Dashboard" bold />
              <MenuItem href="/dashboard/bookings" label="My bookings" />
              <MenuItem href="/dashboard/profile" label="Profile" />
              <MenuItem href="/spaces/list" label="List your space" />
              <div className="my-2 h-px bg-border" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  signOut()
                }}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-accent"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <MenuItem href="/signup" label="Sign up" bold />
              <MenuItem href="/signin" label="Log in" />
              <div className="my-2 h-px bg-border" />
              <MenuItem href="/spaces/list" label="List your space" />
              <MenuItem href="/spaces" label="Browse workspaces" />
            </>
          )}
        </div>
      )}
    </div>
  )
}

function MenuItem({ href, label, bold }: { href: string; label: string; bold?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "block px-4 py-2.5 text-sm hover:bg-accent",
        bold ? "font-medium" : "text-muted-foreground",
      )}
    >
      {label}
    </Link>
  )
}

function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-[2080px] flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row lg:px-10">
        <span>© 2026 The Red Stapler · Workspace sharing</span>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
          <Link href="/" className="hover:underline">Classic home</Link>
        </div>
      </div>
    </footer>
  )
}
