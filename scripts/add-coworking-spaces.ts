import { PrismaClient, SpaceType } from '@prisma/client'

const prisma = new PrismaClient()

// Co-working space images from the public folder
const COWORKING_IMAGES = [
  [
    "/images/spaces/the-red-stapler-coworking-088.webp",
    "/images/spaces/the-red-stapler-coworking-089.webp",
    "/images/spaces/the-red-stapler-coworking-090.webp",
    "/images/spaces/the-red-stapler-coworking-091.webp"
  ],
  [
    "/images/spaces/the-red-stapler-coworking-092.webp",
    "/images/spaces/the-red-stapler-coworking-093.webp",
    "/images/spaces/the-red-stapler-coworking-094.webp",
    "/images/spaces/the-red-stapler-coworking-095.webp"
  ],
  [
    "/images/spaces/the-red-stapler-coworking-096.webp",
    "/images/spaces/the-red-stapler-coworking-097.webp",
    "/images/spaces/the-red-stapler-coworking-098.webp",
    "/images/spaces/the-red-stapler-coworking-099.webp"
  ],
  [
    "/images/spaces/the-red-stapler-coworking-100.webp",
    "/images/spaces/the-red-stapler-coworking-101.webp",
    "/images/spaces/the-red-stapler-coworking-094.webp",
    "/images/spaces/the-red-stapler-coworking-090.webp"
  ]
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
    "Event space",
    "Networking events"
  ],
  standard: [
    "WiFi",
    "Desks",
    "Meeting room",
    "Kitchen",
    "Printer",
    "Coffee",
    "Lounge area"
  ]
}

const COWORKING_SPACES = [
  {
    title: "Enschede Innovation Hub",
    description: "A modern co-working space in the heart of Enschede. Perfect for freelancers, remote workers, and small teams. Our space offers a variety of workspaces from hot desks to dedicated areas, meeting rooms, and event spaces. Join our community of innovators and entrepreneurs!",
    workspaceType: "CO_WORKING",
    address: "Oude Markt 24",
    city: "Enschede",
    postalCode: "7511 GB",
    pricePerDay: 25.0,
    pricePerWeek: 100.0,
    pricePerMonth: 350.0,
    workspaceDetails: JSON.stringify({
      capacity: 50,
      hasHotDesks: true,
      hasDedicatedDesks: true,
      hasPrivateBooths: true,
      hasSmallMeetingRooms: true,
      hasWifi: true,
      hasKitchen: true,
      hasPrinters: true,
      hasEvents: true
    }),
    buildingContext: JSON.stringify({
      buildingType: "commercial",
      hasElevator: true,
      hasParking: true,
      hasReception: true,
      hasSecurity: true
    })
  },
  {
    title: "The Creative Loft",
    description: "A bright and inspiring co-working space in a converted industrial building. The Creative Loft offers a unique atmosphere for designers, developers, and creative professionals. With high ceilings, natural light, and a vibrant community, this is the perfect place to grow your business.",
    workspaceType: "CO_WORKING",
    address: "Roomweg 167",
    city: "Enschede",
    postalCode: "7523 BM",
    pricePerDay: 30.0,
    pricePerWeek: 120.0,
    pricePerMonth: 400.0,
    workspaceDetails: JSON.stringify({
      capacity: 35,
      hasHotDesks: true,
      hasDedicatedDesks: true,
      hasPrivateBooths: false,
      hasSmallMeetingRooms: true,
      hasWifi: true,
      hasKitchen: true,
      hasPrinters: true,
      hasEvents: true
    }),
    buildingContext: JSON.stringify({
      buildingType: "converted",
      hasElevator: false,
      hasParking: true,
      hasReception: false,
      hasSecurity: false
    })
  },
  {
    title: "Campus Co-Working",
    description: "Located near the University of Twente, Campus Co-Working provides a professional environment for students, researchers, and startups. With 24/7 access, high-speed internet, and a range of workspaces, it's the ideal place to focus and collaborate.",
    workspaceType: "CO_WORKING",
    address: "Drienerlolaan 5",
    city: "Enschede",
    postalCode: "7522 NB",
    pricePerDay: 20.0,
    pricePerWeek: 80.0,
    pricePerMonth: 300.0,
    workspaceDetails: JSON.stringify({
      capacity: 40,
      hasHotDesks: true,
      hasDedicatedDesks: true,
      hasPrivateBooths: true,
      hasSmallMeetingRooms: true,
      hasWifi: true,
      hasKitchen: true,
      hasPrinters: true,
      hasEvents: false
    }),
    buildingContext: JSON.stringify({
      buildingType: "academic",
      hasElevator: true,
      hasParking: true,
      hasReception: true,
      hasSecurity: true
    })
  },
  {
    title: "The Business Garden",
    description: "A peaceful co-working space with indoor plants and natural elements to boost productivity and wellbeing. The Business Garden offers a tranquil environment for focused work, with all the amenities you need for a successful workday.",
    workspaceType: "CO_WORKING",
    address: "Hengelosestraat 76",
    city: "Enschede",
    postalCode: "7514 AJ",
    pricePerDay: 28.0,
    pricePerWeek: 110.0,
    pricePerMonth: 380.0,
    workspaceDetails: JSON.stringify({
      capacity: 30,
      hasHotDesks: true,
      hasDedicatedDesks: true,
      hasPrivateBooths: true,
      hasSmallMeetingRooms: false,
      hasWifi: true,
      hasKitchen: true,
      hasPrinters: true,
      hasEvents: false
    }),
    buildingContext: JSON.stringify({
      buildingType: "commercial",
      hasElevator: true,
      hasParking: true,
      hasReception: false,
      hasSecurity: false
    })
  }
]

async function main() {
  console.log('Starting to add co-working spaces...')
  
  // Find a user to be the owner
  const user = await prisma.user.findFirst()
  
  if (!user) {
    console.error('No user found to be the owner of the spaces. Please run the seed script first.')
    return
  }
  
  console.log(`Using user ${user.name || user.email} as the owner`)
  
  // Create co-working spaces
  for (let i = 0; i < COWORKING_SPACES.length; i++) {
    const space = COWORKING_SPACES[i]
    
    try {
      const createdSpace = await prisma.space.create({
        data: {
          title: space.title,
          description: space.description,
          workspaceType: space.workspaceType as any, // Type assertion because CO_WORKING might not be in the enum yet
          address: space.address,
          city: space.city,
          postalCode: space.postalCode,
          country: "Netherlands",
          pricePerDay: space.pricePerDay,
          pricePerWeek: space.pricePerWeek,
          pricePerMonth: space.pricePerMonth,
          workspaceDetails: space.workspaceDetails,
          buildingContext: space.buildingContext,
          photos: JSON.stringify(COWORKING_IMAGES[i % COWORKING_IMAGES.length]),
          amenities: JSON.stringify(i % 2 === 0 ? AMENITIES.premium : AMENITIES.standard),
          coordinates: JSON.stringify({ lat: 52.22 + (Math.random() * 0.05), lng: 6.89 + (Math.random() * 0.05) }),
          hostName: user.name || "Workspace Host",
          hostEmail: user.email || "host@example.com",
          ownerId: user.id,
        },
      })
      
      console.log(`Created co-working space: ${createdSpace.title}`)
    } catch (error) {
      console.error(`Error creating co-working space ${space.title}:`, error)
    }
  }
  
  console.log('Finished adding co-working spaces!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
