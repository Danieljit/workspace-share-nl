import { db } from "@/lib/db"
import { HomePage } from "@/components/pages/home"

export default async function Home() {
  const spaces = await db.space.findMany({
    take: 24, // Increased from 6 to 24 to show more workspaces
    include: {
      owner: true,
    },
    orderBy: {
      createdAt: 'desc' // Show newest workspaces first
    }
  })

  // Transform spaces to match the expected format in the FeaturedSpaces component
  const transformedSpaces = spaces.map(space => {
    // Use type assertion for the space object to access both old and new schema fields
    const spaceAny = space as any
    
    // Check if we're dealing with new schema (has 'title' field) or old schema
    const isNewSchema = 'title' in spaceAny
    
    return {
      ...space,
      // Map new schema fields to old schema field names expected by the component
      name: isNewSchema ? spaceAny.title : spaceAny.name,
      location: isNewSchema 
        ? `${spaceAny.address || ''}, ${spaceAny.city || ''}`.replace(', ,', ',').replace(/^, |, $/g, '') 
        : spaceAny.location || 'Unknown Location',
      price: isNewSchema ? spaceAny.pricePerDay : spaceAny.price,
      images: isNewSchema 
        ? (typeof spaceAny.photos === 'string' ? spaceAny.photos : JSON.stringify(spaceAny.photos || [])) 
        : (typeof spaceAny.images === 'string' ? spaceAny.images : JSON.stringify(spaceAny.images || [])),
      // Keep the rest of the fields as is
    }
  })

  return <HomePage spaces={transformedSpaces as any} />
}
