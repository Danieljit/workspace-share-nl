"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PeopleFiltersProps {
  /** Distinct industries to offer in the industry filter. */
  industries: string[]
}

/**
 * Filter bar for the people directory. Reads the current filters from the URL
 * and pushes an updated query string on submit, which re-renders the server
 * component with the new Prisma query.
 */
export function PeopleFilters({ industries }: PeopleFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(searchParams.get("q") ?? "")
  const [city, setCity] = useState(searchParams.get("city") ?? "")
  const [industry, setIndustry] = useState(searchParams.get("industry") ?? "")

  function applyFilters(next: { q?: string; city?: string; industry?: string }) {
    const params = new URLSearchParams()
    const merged = { q, city, industry, ...next }
    if (merged.q.trim()) params.set("q", merged.q.trim())
    if (merged.city.trim()) params.set("city", merged.city.trim())
    if (merged.industry.trim()) params.set("industry", merged.industry.trim())
    const queryString = params.toString()
    startTransition(() => {
      router.push(queryString ? `/people?${queryString}` : "/people")
    })
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    applyFilters({})
  }

  function onClear() {
    setQ("")
    setCity("")
    setIndustry("")
    startTransition(() => router.push("/people"))
  }

  const hasFilters = Boolean(q || city || industry)

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <Input
        name="q"
        placeholder="Search skills or interests..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search skills or interests"
      />
      <Input
        name="city"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        aria-label="City"
      />
      <select
        name="industry"
        value={industry}
        onChange={(e) => {
          const value = e.target.value
          setIndustry(value)
          applyFilters({ industry: value })
        }}
        aria-label="Industry"
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <option value="">All industries</option>
        {industries.map((ind) => (
          <option key={ind} value={ind}>
            {ind}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          Search
        </Button>
        {hasFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            disabled={isPending}
          >
            Clear
          </Button>
        )}
      </div>
    </form>
  )
}
