"use client"

import Image from "next/image"
import Link from "next/link"
import { Space, User } from "@prisma/client"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface FeaturedSpacesProps {
  spaces: (Space & { owner: User })[]
}

export function FeaturedSpaces({ spaces }: FeaturedSpacesProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">Featured Workspaces</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => {
          const images = JSON.parse(space.images || "[]") as string[]
          const amenities = JSON.parse(space.amenities || "[]") as string[]
          return (
            <Link key={space.id} href={`/spaces/${space.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] relative">
                  {images[0] && (
                    <Image
                      src={images[0]}
                      alt={space.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{space.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {space.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${space.price}</p>
                      <p className="text-sm text-muted-foreground">per day</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
                  {amenities.slice(0, 3).map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                    >
                      {amenity}
                    </span>
                  ))}
                </CardFooter>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
