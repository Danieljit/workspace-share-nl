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
    name: "Amsterdam Central Hub",
    description: "A comfortable desk in our modern co-working space in the heart of Amsterdam. Perfect for freelancers and remote workers.",
    type: SpaceType.DESK,
    location: "Prins Hendrikkade 33, Amsterdam",
    price: 25.0,
    capacity: 1,
  },
  {
    name: "Rotterdam Port Studio",
    description: "Bright and inspiring desk space in our creative studio near Rotterdam's iconic port. Great for designers and artists.",
    type: SpaceType.DESK,
    location: "Wilhelminakade 123, Rotterdam",
    price: 30.0,
    capacity: 1,
  },
  {
    name: "Utrecht Tech Center",
    description: "High-tech desk setup in the historic city center of Utrecht. Perfect for developers and tech enthusiasts.",
    type: SpaceType.DESK,
    location: "Oudegracht 187, Utrecht",
    price: 35.0,
    capacity: 1,
  },
  {
    name: "The Hague Business Hub",
    description: "Peaceful desk in our quiet zone near the government district. Ideal for focused work and productivity.",
    type: SpaceType.DESK,
    location: "Lange Voorhout 44, The Hague",
    price: 28.0,
    capacity: 1,
  },
  {
    name: "Eindhoven Innovation Space",
    description: "Modern workspace in the technology heart of the Netherlands. Perfect for innovators and tech startups.",
    type: SpaceType.DESK,
    location: "High Tech Campus 1, Eindhoven",
    price: 32.0,
    capacity: 1,
  },
  {
    name: "Groningen Student Hub",
    description: "Vibrant co-working space near the university. Great for students and young professionals.",
    type: SpaceType.DESK,
    location: "Grote Markt 29, Groningen",
    price: 22.0,
    capacity: 1,
  },
  {
    name: "Delft Design Studio",
    description: "Creative workspace in the historic city center. Perfect for designers and architects.",
    type: SpaceType.DESK,
    location: "Markt 87, Delft",
    price: 27.0,
    capacity: 1,
  },
  {
    name: "Maastricht Cultural Space",
    description: "Inspiring workspace in a renovated historic building. Ideal for creatives and cultural professionals.",
    type: SpaceType.DESK,
    location: "Vrijthof 47, Maastricht",
    price: 29.0,
    capacity: 1,
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
    SPACES.map((space, index) =>
      prisma.space.create({
        data: {
          ...space,
          images: JSON.stringify(WORKSPACE_IMAGES[index % WORKSPACE_IMAGES.length]),
          amenities: JSON.stringify(
            index % 2 === 0 ? AMENITIES.premium : AMENITIES.basic
          ),
          ownerId: hosts[index % hosts.length].id,
        },
      })
    )
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
