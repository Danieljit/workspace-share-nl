interface SpaceAmenitiesProps {
  amenities: {
    furniture?: string[]
    technology?: string[]
    facilities?: string[]
    refreshments?: string[]
    services?: string[]
  }
}

export function SpaceAmenities({ amenities }: SpaceAmenitiesProps) {
  const categories = [
    {
      title: "Furniture & Hardware",
      items: amenities.furniture,
      icon: "🪑",
    },
    {
      title: "Technology & Connectivity",
      items: amenities.technology,
      icon: "💻",
    },
    {
      title: "Shared Facilities",
      items: amenities.facilities,
      icon: "🏢",
    },
    {
      title: "Refreshments",
      items: amenities.refreshments,
      icon: "☕",
    },
    {
      title: "Support Services",
      items: amenities.services,
      icon: "🛠️",
    },
  ]

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category.title} className="space-y-2">
          <h3 className="flex items-center space-x-2 font-semibold">
            <span>{category.icon}</span>
            <span>{category.title}</span>
          </h3>
          {category.items?.length ? (
            <ul className="grid grid-cols-2 gap-2 text-gray-500">
              {category.items.map((item) => (
                <li key={item} className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No amenities listed</p>
          )}
        </div>
      ))}
    </div>
  )
}
