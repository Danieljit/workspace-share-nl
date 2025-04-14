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
          // Handle both old and new schema
          const isNewSchema = 'title' in space;
          const name = isNewSchema ? space.title : (space as any).name;
          const location = isNewSchema ? 
            `${space.address || ''}, ${space.city || ''}`.replace(', ,', ',').replace(/^, |, $/g, '') : 
            (space as any).location;
          const price = isNewSchema ? space.pricePerDay : (space as any).price;
          
          // Parse photos/images safely
          let images: string[] = [];
          try {
            if (space.photos) {
              if (typeof space.photos === 'string') {
                images = JSON.parse(space.photos);
              } else if (Array.isArray(space.photos)) {
                images = space.photos as unknown as string[];
              }
            } else if ((space as any).images) {
              const oldImages = (space as any).images;
              if (typeof oldImages === 'string') {
                images = JSON.parse(oldImages);
              } else if (Array.isArray(oldImages)) {
                images = oldImages;
              }
            }
          } catch (e) {
            console.error('Error parsing images:', e);
            images = [];
          }
          
          // Parse amenities safely
          let amenities: string[] = [];
          try {
            if (space.amenities) {
              if (typeof space.amenities === 'string') {
                amenities = JSON.parse(space.amenities);
              } else if (Array.isArray(space.amenities)) {
                amenities = space.amenities as unknown as string[];
              }
            }
          } catch (e) {
            console.error('Error parsing amenities:', e);
            amenities = [];
          }
          
          return (
            <Link key={space.id} href={`/spaces/${space.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] relative">
                  {images[0] && (
                    <Image
                      src={images[0]}
                      alt={name || 'Workspace'}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{name || 'Unnamed Space'}</h3>
                      <p className="text-base text-muted-foreground line-clamp-1">
                        {location || 'Unknown Location'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">${Math.round(price || 0)}</p>
                      <p className="text-base text-muted-foreground">per day</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
                  {amenities.slice(0, 3).map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800"
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
