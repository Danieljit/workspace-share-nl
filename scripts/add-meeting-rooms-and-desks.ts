import { PrismaClient, SpaceType } from '@prisma/client'

const prisma = new PrismaClient()

// Meeting room images from the public folder
const MEETING_ROOM_IMAGES = [
  // Group 1 - Enschede
  [
    "/images/spaces/the-red-stapler-meeting-room-102.webp",
    "/images/spaces/the-red-stapler-meeting-room-103.webp",
    "/images/spaces/the-red-stapler-meeting-room-104.webp",
    "/images/spaces/the-red-stapler-meeting-room-105.webp"
  ],
  // Group 2 - Hengelo
  [
    "/images/spaces/the-red-stapler-meeting-room-106.webp",
    "/images/spaces/the-red-stapler-meeting-room-107.webp",
    "/images/spaces/the-red-stapler-meeting-room-108.webp",
    "/images/spaces/the-red-stapler-meeting-room-109.webp"
  ],
  // Group 3 - Haaksbergen
  [
    "/images/spaces/the-red-stapler-meeting-room-110.webp",
    "/images/spaces/the-red-stapler-meeting-room-111.webp",
    "/images/spaces/the-red-stapler-meeting-room-112.webp",
    "/images/spaces/the-red-stapler-meeting-room-113.webp"
  ],
  // Group 4 - Enschede (second location)
  [
    "/images/spaces/the-red-stapler-meeting-room-114.webp",
    "/images/spaces/the-red-stapler-meeting-room-115.webp",
    "/images/spaces/the-red-stapler-meeting-room-116.webp",
    "/images/spaces/the-red-stapler-meeting-room-117.webp"
  ],
  // Group 5 - Hengelo (second location)
  [
    "/images/spaces/the-red-stapler-meeting-room-118.webp",
    "/images/spaces/the-red-stapler-meeting-room-119.webp",
    "/images/spaces/the-red-stapler-meeting-room-102.webp", // Reusing some images
    "/images/spaces/the-red-stapler-meeting-room-103.webp"
  ]
]

// Single desk images from the public folder
const SINGLE_DESK_IMAGES = [
  // Group 1 - Enschede
  [
    "/images/spaces/the-red-stapler-single-desk-059.webp",
    "/images/spaces/the-red-stapler-single-desk-060.webp",
    "/images/spaces/the-red-stapler-single-desk-061.webp",
    "/images/spaces/the-red-stapler-single-desk-062.webp"
  ],
  // Group 2 - Hengelo
  [
    "/images/spaces/the-red-stapler-single-desk-063.webp",
    "/images/spaces/the-red-stapler-single-desk-064.webp",
    "/images/spaces/the-red-stapler-single-desk-065.webp",
    "/images/spaces/the-red-stapler-single-desk-066.webp"
  ],
  // Group 3 - Haaksbergen
  [
    "/images/spaces/the-red-stapler-single-desk-067.webp",
    "/images/spaces/the-red-stapler-single-desk-068.webp",
    "/images/spaces/the-red-stapler-single-desk-069.webp",
    "/images/spaces/the-red-stapler-single-desk-070.webp"
  ],
  // Group 4 - Enschede (second location)
  [
    "/images/spaces/the-red-stapler-single-desk-071.webp",
    "/images/spaces/the-red-stapler-single-desk-072.webp",
    "/images/spaces/the-red-stapler-single-desk-073.webp",
    "/images/spaces/the-red-stapler-single-desk-074.webp"
  ],
  // Group 5 - Hengelo (second location)
  [
    "/images/spaces/the-red-stapler-single-desk-075.webp",
    "/images/spaces/the-red-stapler-single-desk-076.webp",
    "/images/spaces/the-red-stapler-single-desk-077.webp",
    "/images/spaces/the-red-stapler-single-desk-078.webp"
  ],
  // Group 6 - Haaksbergen (second location)
  [
    "/images/spaces/the-red-stapler-single-desk-079.webp",
    "/images/spaces/the-red-stapler-single-desk-080.webp",
    "/images/spaces/the-red-stapler-single-desk-081.webp",
    "/images/spaces/the-red-stapler-single-desk-082.webp"
  ],
  // Group 7 - Enschede (third location)
  [
    "/images/spaces/the-red-stapler-single-desk-083.webp",
    "/images/spaces/the-red-stapler-single-desk-084.webp",
    "/images/spaces/the-red-stapler-single-desk-085.webp",
    "/images/spaces/the-red-stapler-single-desk-086.webp"
  ],
  // Group 8 - Hengelo (third location)
  [
    "/images/spaces/the-red-stapler-single-desk-087.webp",
    "/images/spaces/the-red-stapler-single-desk-059.webp", // Reusing some images
    "/images/spaces/the-red-stapler-single-desk-060.webp",
    "/images/spaces/the-red-stapler-single-desk-061.webp"
  ]
]

const AMENITIES = {
  premium: [
    "High-speed WiFi",
    "Adjustable lighting",
    "Video conferencing equipment",
    "Whiteboard",
    "Projector",
    "Smart TV",
    "Coffee and refreshments",
    "Catering options",
    "Climate control",
    "Ergonomic chairs",
    "Noise cancellation",
    "Tech support"
  ],
  standard: [
    "WiFi",
    "Whiteboard",
    "TV screen",
    "Coffee",
    "Water",
    "Air conditioning"
  ],
  desk: [
    "High-speed WiFi",
    "Ergonomic chair",
    "Adjustable desk",
    "Power outlets",
    "Natural lighting",
    "Coffee and tea",
    "Printing services",
    "Locker storage",
    "Quiet environment",
    "Climate control"
  ]
}

// Meeting room spaces with accurate location data
const MEETING_ROOM_SPACES = [
  // Enschede locations
  {
    title: "Modern Meeting Space - City Center",
    description: "A professional meeting room in the heart of Enschede, perfect for client meetings, presentations, and team workshops. Features high-speed internet, video conferencing equipment, and a smart TV for presentations.",
    workspaceType: SpaceType.MEETING_ROOM,
    address: "Oude Markt 15",
    city: "Enschede",
    postalCode: "7511 GA",
    coordinates: { lat: 52.2215, lng: 6.8936 },
    pricePerDay: 120.0,
    pricePerWeek: 550.0,
    pricePerMonth: null, // Not available for monthly booking
    workspaceDetails: JSON.stringify({
      capacity: 8,
      hasVideoConferencing: true,
      hasWhiteboard: true,
      hasProjector: true,
      hasSmartTV: true,
      hasCatering: true
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
    title: "Executive Boardroom - University Business Park",
    description: "An executive boardroom located in the University Business Park. This premium meeting space is ideal for important client meetings, board discussions, and strategic planning sessions. Equipped with state-of-the-art technology and elegant furnishings.",
    workspaceType: SpaceType.MEETING_ROOM,
    address: "Hengelosestraat 705",
    city: "Enschede",
    postalCode: "7521 PA",
    coordinates: { lat: 52.2397, lng: 6.8461 },
    pricePerDay: 180.0,
    pricePerWeek: 800.0,
    pricePerMonth: null,
    workspaceDetails: JSON.stringify({
      capacity: 12,
      hasVideoConferencing: true,
      hasWhiteboard: true,
      hasProjector: true,
      hasSmartTV: true,
      hasCatering: true
    }),
    buildingContext: JSON.stringify({
      buildingType: "business park",
      hasElevator: true,
      hasParking: true,
      hasReception: true,
      hasSecurity: true
    })
  },
  
  // Hengelo locations
  {
    title: "Creative Meeting Space - Hengelo",
    description: "A bright and creative meeting room in central Hengelo. Perfect for brainstorming sessions, team meetings, and creative workshops. The space features colorful design elements to inspire innovation and collaboration.",
    workspaceType: SpaceType.MEETING_ROOM,
    address: "Marktstraat 12",
    city: "Hengelo",
    postalCode: "7551 CJ",
    coordinates: { lat: 52.2667, lng: 6.7931 },
    pricePerDay: 100.0,
    pricePerWeek: 450.0,
    pricePerMonth: null,
    workspaceDetails: JSON.stringify({
      capacity: 6,
      hasVideoConferencing: true,
      hasWhiteboard: true,
      hasProjector: false,
      hasSmartTV: true,
      hasCatering: false
    }),
    buildingContext: JSON.stringify({
      buildingType: "commercial",
      hasElevator: true,
      hasParking: true,
      hasReception: false,
      hasSecurity: false
    })
  },
  {
    title: "Tech Hub Conference Room - Hengelo",
    description: "A high-tech conference room in Hengelo's business district. Equipped with advanced video conferencing systems, interactive displays, and fast internet. Ideal for virtual meetings, tech presentations, and digital workshops.",
    workspaceType: SpaceType.MEETING_ROOM,
    address: "Industrieplein 5",
    city: "Hengelo",
    postalCode: "7553 LL",
    coordinates: { lat: 52.2583, lng: 6.7789 },
    pricePerDay: 150.0,
    pricePerWeek: 650.0,
    pricePerMonth: null,
    workspaceDetails: JSON.stringify({
      capacity: 10,
      hasVideoConferencing: true,
      hasWhiteboard: true,
      hasProjector: true,
      hasSmartTV: true,
      hasCatering: true
    }),
    buildingContext: JSON.stringify({
      buildingType: "business park",
      hasElevator: true,
      hasParking: true,
      hasReception: true,
      hasSecurity: true
    })
  },
  
  // Haaksbergen location
  {
    title: "Countryside Meeting Venue - Haaksbergen",
    description: "A peaceful meeting room in the scenic town of Haaksbergen. Located away from the hustle and bustle of the city, this space offers a tranquil environment for focused discussions, strategy sessions, and team retreats.",
    workspaceType: SpaceType.MEETING_ROOM,
    address: "Markt 3",
    city: "Haaksbergen",
    postalCode: "7481 HT",
    coordinates: { lat: 52.1575, lng: 6.7381 },
    pricePerDay: 90.0,
    pricePerWeek: 400.0,
    pricePerMonth: null,
    workspaceDetails: JSON.stringify({
      capacity: 8,
      hasVideoConferencing: true,
      hasWhiteboard: true,
      hasProjector: true,
      hasSmartTV: false,
      hasCatering: true
    }),
    buildingContext: JSON.stringify({
      buildingType: "converted house",
      hasElevator: false,
      hasParking: true,
      hasReception: false,
      hasSecurity: false
    })
  }
]

// Single desk spaces with accurate location data
const SINGLE_DESK_SPACES = [
  // Enschede locations
  {
    title: "Premium Single Desk - Enschede City Center",
    description: "A comfortable single desk in our modern co-working space in the heart of Enschede. Perfect for freelancers and remote workers who need a professional environment with all amenities. Includes high-speed internet, ergonomic furniture, and access to meeting rooms.",
    workspaceType: SpaceType.DESK,
    address: "Oude Markt 24",
    city: "Enschede",
    postalCode: "7511 GB",
    coordinates: { lat: 52.2217, lng: 6.8932 },
    pricePerDay: 25.0,
    pricePerWeek: 100.0,
    pricePerMonth: 350.0,
    workspaceDetails: JSON.stringify({
      hasAdjustableDesk: true,
      hasErgonomicChair: true,
      hasMonitor: true,
      hasStorage: true,
      hasPrivacy: false,
      hasNaturalLight: true
    }),
    buildingContext: JSON.stringify({
      buildingType: "commercial",
      hasElevator: true,
      hasParking: false,
      hasReception: true,
      hasSecurity: true
    })
  },
  {
    title: "Creative Desk Space - Enschede Art District",
    description: "A bright and inspiring desk space in our creative studio in Enschede's art district. Great for designers, artists, and creative professionals. The space features natural light, artistic surroundings, and a community of creative individuals.",
    workspaceType: SpaceType.DESK,
    address: "Roomweg 80",
    city: "Enschede",
    postalCode: "7523 BR",
    coordinates: { lat: 52.2304, lng: 6.8867 },
    pricePerDay: 20.0,
    pricePerWeek: 80.0,
    pricePerMonth: 280.0,
    workspaceDetails: JSON.stringify({
      hasAdjustableDesk: false,
      hasErgonomicChair: true,
      hasMonitor: false,
      hasStorage: true,
      hasPrivacy: false,
      hasNaturalLight: true
    }),
    buildingContext: JSON.stringify({
      buildingType: "converted warehouse",
      hasElevator: false,
      hasParking: true,
      hasReception: false,
      hasSecurity: false
    })
  },
  {
    title: "Tech Desk - University Innovation Hub",
    description: "A high-tech desk setup in the University of Twente Innovation Hub. Perfect for developers, researchers, and tech enthusiasts. Includes dual-monitor setup, fast internet, and access to university resources and networking events.",
    workspaceType: SpaceType.DESK,
    address: "Drienerlolaan 5",
    city: "Enschede",
    postalCode: "7522 NB",
    coordinates: { lat: 52.2390, lng: 6.8532 },
    pricePerDay: 30.0,
    pricePerWeek: 120.0,
    pricePerMonth: 400.0,
    workspaceDetails: JSON.stringify({
      hasAdjustableDesk: true,
      hasErgonomicChair: true,
      hasMonitor: true,
      hasStorage: true,
      hasPrivacy: true,
      hasNaturalLight: true
    }),
    buildingContext: JSON.stringify({
      buildingType: "university",
      hasElevator: true,
      hasParking: true,
      hasReception: true,
      hasSecurity: true
    })
  },
  
  // Hengelo locations
  {
    title: "Business Desk - Hengelo Center",
    description: "A professional desk space in the heart of Hengelo. Ideal for business professionals who need a central location with easy access to shops, restaurants, and public transportation. The space offers a quiet environment for focused work.",
    workspaceType: SpaceType.DESK,
    address: "Marktstraat 15",
    city: "Hengelo",
    postalCode: "7551 CG",
    coordinates: { lat: 52.2664, lng: 6.7933 },
    pricePerDay: 22.0,
    pricePerWeek: 90.0,
    pricePerMonth: 320.0,
    workspaceDetails: JSON.stringify({
      hasAdjustableDesk: false,
      hasErgonomicChair: true,
      hasMonitor: true,
      hasStorage: true,
      hasPrivacy: false,
      hasNaturalLight: true
    }),
    buildingContext: JSON.stringify({
      buildingType: "commercial",
      hasElevator: true,
      hasParking: false,
      hasReception: true,
      hasSecurity: false
    })
  },
  {
    title: "Industrial Style Desk - Hengelo Business Park",
    description: "A stylish desk in our industrial-themed workspace in Hengelo's business park. The space features exposed brick walls, high ceilings, and modern amenities. Perfect for those who appreciate a unique work environment with character.",
    workspaceType: SpaceType.DESK,
    address: "Industrieplein 2",
    city: "Hengelo",
    postalCode: "7553 LL",
    coordinates: { lat: 52.2581, lng: 6.7787 },
    pricePerDay: 25.0,
    pricePerWeek: 100.0,
    pricePerMonth: 350.0,
    workspaceDetails: JSON.stringify({
      hasAdjustableDesk: true,
      hasErgonomicChair: true,
      hasMonitor: false,
      hasStorage: true,
      hasPrivacy: false,
      hasNaturalLight: true
    }),
    buildingContext: JSON.stringify({
      buildingType: "converted factory",
      hasElevator: true,
      hasParking: true,
      hasReception: false,
      hasSecurity: true
    })
  },
  {
    title: "Quiet Focus Desk - Hengelo North",
    description: "A quiet desk space in a peaceful area of northern Hengelo. Designed for maximum focus and productivity, this space is perfect for writers, programmers, and anyone who needs minimal distractions. Features noise-reducing design and private booths.",
    workspaceType: SpaceType.DESK,
    address: "Deldenerstraat 70",
    city: "Hengelo",
    postalCode: "7551 AG",
    coordinates: { lat: 52.2729, lng: 6.7855 },
    pricePerDay: 28.0,
    pricePerWeek: 110.0,
    pricePerMonth: 380.0,
    workspaceDetails: JSON.stringify({
      hasAdjustableDesk: true,
      hasErgonomicChair: true,
      hasMonitor: true,
      hasStorage: true,
      hasPrivacy: true,
      hasNaturalLight: false
    }),
    buildingContext: JSON.stringify({
      buildingType: "office building",
      hasElevator: true,
      hasParking: true,
      hasReception: true,
      hasSecurity: true
    })
  },
  
  // Haaksbergen locations
  {
    title: "Countryside Desk - Haaksbergen",
    description: "A peaceful desk space in the charming town of Haaksbergen. Surrounded by nature, this workspace offers a tranquil environment away from the city noise. Perfect for those who appreciate a calm atmosphere and beautiful surroundings.",
    workspaceType: SpaceType.DESK,
    address: "Markt 8",
    city: "Haaksbergen",
    postalCode: "7481 HT",
    coordinates: { lat: 52.1574, lng: 6.7384 },
    pricePerDay: 18.0,
    pricePerWeek: 75.0,
    pricePerMonth: 260.0,
    workspaceDetails: JSON.stringify({
      hasAdjustableDesk: false,
      hasErgonomicChair: true,
      hasMonitor: false,
      hasStorage: true,
      hasPrivacy: false,
      hasNaturalLight: true
    }),
    buildingContext: JSON.stringify({
      buildingType: "converted house",
      hasElevator: false,
      hasParking: true,
      hasReception: false,
      hasSecurity: false
    })
  },
  {
    title: "Community Workspace - Haaksbergen Center",
    description: "A friendly desk space in a community-focused workspace in central Haaksbergen. This space is great for networking, collaboration, and being part of a supportive local business community. Regular events and workshops are organized for members.",
    workspaceType: SpaceType.DESK,
    address: "Spoorstraat 10",
    city: "Haaksbergen",
    postalCode: "7481 JW",
    coordinates: { lat: 52.1566, lng: 6.7399 },
    pricePerDay: 20.0,
    pricePerWeek: 80.0,
    pricePerMonth: 280.0,
    workspaceDetails: JSON.stringify({
      hasAdjustableDesk: false,
      hasErgonomicChair: true,
      hasMonitor: true,
      hasStorage: true,
      hasPrivacy: false,
      hasNaturalLight: true
    }),
    buildingContext: JSON.stringify({
      buildingType: "commercial",
      hasElevator: false,
      hasParking: true,
      hasReception: true,
      hasSecurity: false
    })
  }
]

async function main() {
  console.log(`Start seeding meeting rooms and single desks...`)
  
  // Find the first user to assign as owner
  const firstUser = await prisma.user.findFirst()
  
  if (!firstUser) {
    throw new Error("No users found in the database. Please seed users first.")
  }
  
  // Add meeting rooms
  for (let i = 0; i < MEETING_ROOM_SPACES.length; i++) {
    const space = MEETING_ROOM_SPACES[i]
    const imageGroup = MEETING_ROOM_IMAGES[i % MEETING_ROOM_IMAGES.length]
    
    // Select random amenities
    const amenities = [...AMENITIES.premium]
      .sort(() => 0.5 - Math.random())
      .slice(0, 6 + Math.floor(Math.random() * 5))
    
    console.log(`Creating meeting room: ${space.title} in ${space.city}`)
    
    await prisma.space.create({
      data: {
        title: space.title,
        description: space.description,
        workspaceType: space.workspaceType as SpaceType,
        workspaceDetails: space.workspaceDetails,
        address: space.address,
        city: space.city,
        postalCode: space.postalCode,
        coordinates: JSON.stringify(space.coordinates),
        amenities: JSON.stringify(amenities),
        photos: JSON.stringify(imageGroup),
        pricePerDay: space.pricePerDay,
        pricePerWeek: space.pricePerWeek,
        pricePerMonth: space.pricePerMonth,
        buildingContext: space.buildingContext,
        hostName: firstUser.name || "Workspace Host",
        ownerId: firstUser.id,
      },
    })
  }
  
  // Add single desks
  for (let i = 0; i < SINGLE_DESK_SPACES.length; i++) {
    const space = SINGLE_DESK_SPACES[i]
    const imageGroup = SINGLE_DESK_IMAGES[i % SINGLE_DESK_IMAGES.length]
    
    // Select random amenities
    const amenities = [...AMENITIES.desk]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5 + Math.floor(Math.random() * 5))
    
    console.log(`Creating single desk: ${space.title} in ${space.city}`)
    
    await prisma.space.create({
      data: {
        title: space.title,
        description: space.description,
        workspaceType: space.workspaceType as SpaceType,
        workspaceDetails: space.workspaceDetails,
        address: space.address,
        city: space.city,
        postalCode: space.postalCode,
        coordinates: JSON.stringify(space.coordinates),
        amenities: JSON.stringify(amenities),
        photos: JSON.stringify(imageGroup),
        pricePerDay: space.pricePerDay,
        pricePerWeek: space.pricePerWeek,
        pricePerMonth: space.pricePerMonth,
        buildingContext: space.buildingContext,
        hostName: firstUser.name || "Workspace Host",
        ownerId: firstUser.id,
      },
    })
  }
  
  console.log(`Seeding completed successfully!`)
  console.log(`Added ${MEETING_ROOM_SPACES.length} meeting rooms and ${SINGLE_DESK_SPACES.length} single desks`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
