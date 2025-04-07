"use client"

import { Card } from "@/components/ui/card"

const QUICK_FILTERS = [
  {
    label: "Parking Available",
    value: "parking",
    icon: "local_parking",
  },
  {
    label: "Standing Desk",
    value: "standing_desk",
    icon: "table",
  },
  {
    label: "Dog Friendly",
    value: "dog_friendly",
    icon: "pets",
  },
  {
    label: "Quiet Zone",
    value: "quiet_zone",
    icon: "volume_off",
  },
  {
    label: "External Monitor",
    value: "monitor",
    icon: "desktop_windows",
  },
  {
    label: "Shower",
    value: "shower",
    icon: "shower",
  },
  {
    label: "Bike Storage",
    value: "bike_storage",
    icon: "pedal_bike",
  },
  {
    label: "Premium Coffee",
    value: "premium_coffee",
    icon: "coffee",
  },
]

interface QuickFiltersProps {
  onFilterClick: (filter: string) => void
  activeFilters: string[]
}

export function QuickFilters({ onFilterClick, activeFilters }: QuickFiltersProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {QUICK_FILTERS.map((filter) => (
        <Card
          key={filter.value}
          onClick={() => onFilterClick(filter.value)}
          className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
            activeFilters.includes(filter.value)
              ? "bg-primary text-white shadow-md"
              : "hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <span 
              className="material-symbols-outlined" 
              style={{ fontSize: '64px', lineHeight: '1' }}
            >
              {filter.icon}
            </span>
            <span className="text-sm font-medium">{filter.label}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
