import { PrismaClient, SpaceType } from '@prisma/client'

const prisma = new PrismaClient()

const HOSTS = [
  {
    name: "Sarah Johnson",
    email: "sarah@coworkspace.com",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
  },
  {
    name: "Michael Chen",
    email: "michael@techspace.com",
    image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
  },
  {
    name: "Emily Rodriguez",
    email: "emily@creativeoffices.com",
    image: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
  },
]

const WORKSPACE_IMAGES = [
  [
    "https://images.pexels.com/photos/1743555/pexels-photo-1743555.jpeg",
    "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg",
    "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg",
    "https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg",
    "https://images.pexels.com/photos/2451616/pexels-photo-2451616.jpeg",
  ],
  [
    "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg",
    "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg",
    "https://images.pexels.com/photos/1181435/pexels-photo-1181435.jpeg",
    "https://images.pexels.com/photos/1181400/pexels-photo-1181400.jpeg",
    "https://images.pexels.com/photos/1181403/pexels-photo-1181403.jpeg",
  ],
  [
    "https://images.pexels.com/photos/3182746/pexels-photo-3182746.jpeg",
    "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg",
    "https://images.pexels.com/photos/3182833/pexels-photo-3182833.jpeg",
    "https://images.pexels.com/photos/3182835/pexels-photo-3182835.jpeg",
    "https://images.pexels.com/photos/3182837/pexels-photo-3182837.jpeg",
  ],
]

const AMENITIES = {
  premium: [
    "High-speed WiFi",
    "Standing desks",
    "Meeting rooms",
    "Kitchen",
    "Printer access",
    "Phone booths",
    "24/7 access",
    "Bike storage",
    "Shower facilities",
    "Free coffee",
  ],
  basic: [
    "WiFi",
    "Desks",
    "Meeting room",
    "Kitchen",
    "Printer",
  ],
}

const SPACES = [
  {
    title: "Enschede Innovation Hub",
    description: "A comfortable desk in our modern co-working space in the heart of Enschede. Perfect for freelancers and remote workers.",
    workspaceType: SpaceType.DESK,
    address: "Oude Markt 24",
    city: "Enschede",
    postalCode: "7511 GB",
    pricePerDay: 25.0,
    hostName: "Sarah Johnson",
  },
  {
    title: "Hengelo Creative Studio",
    description: "Bright and inspiring desk space in our creative studio near Hengelo's city center. Great for designers and artists.",
    workspaceType: SpaceType.DESK,
    address: "Marktstraat 15",
    city: "Hengelo",
    postalCode: "7551 CG",
    pricePerDay: 30.0,
    hostName: "Michael Chen",
  },
  {
    title: "Oldenzaal Tech Center",
    description: "High-tech desk setup in the historic city center of Oldenzaal. Perfect for developers and tech enthusiasts.",
    workspaceType: SpaceType.DESK,
    address: "Grootestraat 35",
    city: "Oldenzaal",
    postalCode: "7571 EK",
    pricePerDay: 35.0,
    hostName: "Emily Rodriguez",
  },
  {
    title: "Almelo Business Hub",
    description: "Peaceful desk in our quiet zone near the city center. Ideal for focused work and productivity.",
    workspaceType: SpaceType.DESK,
    address: "Grotestraat 97",
    city: "Almelo",
    postalCode: "7607 CH",
    pricePerDay: 28.0,
    hostName: "Sarah Johnson",
  },
  {
    title: "UT Campus Workspace",
    description: "Modern workspace on the University of Twente campus. Perfect for students and academic professionals.",
    workspaceType: SpaceType.DESK,
    address: "Drienerlolaan 5",
    city: "Enschede",
    postalCode: "7522 NB",
    pricePerDay: 32.0,
    hostName: "Michael Chen",
  },
  {
    title: "Saxion Student Hub",
    description: "Vibrant co-working space near Saxion University. Great for students and young professionals.",
    workspaceType: SpaceType.DESK,
    address: "M.H. Tromplaan 28",
    city: "Enschede",
    postalCode: "7513 AB",
    pricePerDay: 22.0,
    hostName: "Emily Rodriguez",
  },
  {
    title: "Roombeek Design Studio",
    description: "Creative workspace in the artistic Roombeek district. Perfect for designers and architects.",
    workspaceType: SpaceType.DESK,
    address: "Roomweg 167",
    city: "Enschede",
    postalCode: "7523 BM",
    pricePerDay: 27.0,
    hostName: "Sarah Johnson",
  },
  {
    title: "Haaksbergen Rural Office",
    description: "Peaceful workspace in a renovated farmhouse. Ideal for those seeking a quiet work environment away from the city.",
    workspaceType: SpaceType.DESK,
    address: "Markt 3",
    city: "Haaksbergen",
    postalCode: "7481 HS",
    pricePerDay: 29.0,
    hostName: "Michael Chen",
  }
]

async function main() {
  // Delete existing data
  await prisma.booking.deleteMany()
  await prisma.review.deleteMany()
  await prisma.space.deleteMany()
  await prisma.user.deleteMany()

  // Create hosts
  const hosts = await Promise.all(
    HOSTS.map((host) =>
      prisma.user.create({
        data: {
          name: host.name,
          email: host.email,
          image: host.image,
        },
      })
    )
  )

  // Create spaces
  await Promise.all(
    SPACES.map((space, index) => {
      // Find the host by name or fall back to using the index
      const host = hosts.find((h) => h.name === space.hostName) || hosts[index % hosts.length];
      
      return prisma.space.create({
        data: {
          ...space,
          photos: JSON.stringify(WORKSPACE_IMAGES[index % WORKSPACE_IMAGES.length]),
          amenities: JSON.stringify(
            index % 2 === 0 ? AMENITIES.premium : AMENITIES.basic
          ),
          coordinates: JSON.stringify({ lat: 52.2 + (Math.random() * 0.1), lng: 6.8 + (Math.random() * 0.1) }),
          ownerId: host.id,
        },
      })
    })
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
