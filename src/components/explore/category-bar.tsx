"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface Category {
  key: string
  label: string
  icon: LucideIcon
}

interface CategoryBarProps {
  categories: Category[]
  active: string
  onChange: (key: string) => void
}

export function CategoryBar({ categories, active, onChange }: CategoryBarProps) {
  return (
    <div className="flex items-center gap-8 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((cat) => {
        const Icon = cat.icon
        const isActive = cat.key === active
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onChange(cat.key)}
            className={cn(
              "group flex shrink-0 flex-col items-center gap-2 border-b-2 pb-2 pt-1 transition-colors",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
            )}
          >
            <Icon className="h-6 w-6" strokeWidth={1.6} />
            <span className="whitespace-nowrap text-xs font-medium">{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}
