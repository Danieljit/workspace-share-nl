const { PrismaClient } = require('@prisma/client');
const { SpaceType } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to generate a random number between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Helper function to generate a random float between min and max with 2 decimal places
function randomPrice(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// Helper function to pick a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to generate a slug from a title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Mock data for cities
const cities = [
  'Enschede',
  'Hengelo',
  'Almelo'
];

// Mock data for street names
const streetNames = [
  'Hoofdstraat', 'Marktstraat', 'Stationsweg', 'Havenweg', 'Industrieweg',
  'Parkweg', 'Kerkstraat', 'Schoolstraat', 'Molenweg', 'Dorpsstraat',
  'Brinkstraat', 'Centrumplein', 'Innovatieweg', 'Technologiepark', 'Universiteitsstraat',
  'Oude Markt', 'Nieuwstraat', 'Zuiderhagen', 'Noorderhagen', 'Hengelosestraat'
];

// Mock data for workspace types
const workspaceTypes = [
  SpaceType.DESK,
  SpaceType.OFFICE,
  SpaceType.MEETING_ROOM,
  SpaceType.EVENT_SPACE
];

// Mock data for coworking space names
const coworkingNames = [
  'The Hub', 'Workspace Central', 'Innovation Loft', 'Creative Desk', 'Tech Campus',
  'Startup Station', 'Flex Office', 'Cowork Connect', 'Digital Desk', 'Business Hub',
  'The Workshop', 'Entrepreneur Center', 'Productivity Space', 'Focus Office', 'Collaboration Hub'
];

// Mock data for coffee house names
const coffeeHouseNames = [
  'Beans & Bytes', 'Coffee & Code', 'Digital Brew', 'Laptop Lounge', 'The Working Cup',
  'Caffeinated Workspace', 'Java Junction', 'The Remote Café', 'Mocha Office', 'Espresso Desk'
];

// Mock data for company names
const companyNames = [
  'Techify Solutions', 'Innovate BV', 'Digital Dynamics', 'Future Works', 'Smart Office Inc.',
  'Nexus Group', 'Quantum Spaces', 'Horizon Offices', 'Elevate Workspaces', 'Synergy Solutions'
];

// Basic amenities that most workspaces should have
const basicAmenities = [
  'High-speed WiFi',
  'Coffee & Tea',
  'Restroom Access',
  'Heating & Cooling',
  'Comfortable Desk & Chair'
];

// Additional amenities for variety
const additionalAmenities = [
  'External Monitor',
  'Standing Desk Option',
  'Ergonomic Chair',
  'Meeting Room Access',
  'Phone Booth',
  'Printer & Scanner',
  'Kitchen Access',
  'Lounge Area',
  'Outdoor Terrace',
  'Bike Storage',
  'Shower Facilities',
  'Free Parking',
  'Mail Handling',
  'Reception Services',
  '24/7 Access',
  'Security System',
  'Event Space',
  'Podcast Studio',
  'Whiteboard',
  'Projector',
  'Snacks & Drinks',
  'Lockers',
  'Gym Access',
  'Childcare Services'
];

// Availability patterns
const availabilityPatterns = [
  // Standard 9-5 weekdays
  {
    Monday: { open: '09:00', close: '17:00' },
    Tuesday: { open: '09:00', close: '17:00' },
    Wednesday: { open: '09:00', close: '17:00' },
    Thursday: { open: '09:00', close: '17:00' },
    Friday: { open: '09:00', close: '17:00' },
    Saturday: 'Closed',
    Sunday: 'Closed'
  },
  // Extended hours weekdays
  {
    Monday: { open: '08:00', close: '18:00' },
    Tuesday: { open: '08:00', close: '18:00' },
    Wednesday: { open: '08:00', close: '18:00' },
    Thursday: { open: '08:00', close: '18:00' },
    Friday: { open: '08:00', close: '18:00' },
    Saturday: 'Closed',
    Sunday: 'Closed'
  },
  // Including Saturday
  {
    Monday: { open: '08:00', close: '18:00' },
    Tuesday: { open: '08:00', close: '18:00' },
    Wednesday: { open: '08:00', close: '18:00' },
    Thursday: { open: '08:00', close: '18:00' },
    Friday: { open: '08:00', close: '18:00' },
    Saturday: { open: '10:00', close: '16:00' },
    Sunday: 'Closed'
  },
  // 24/7 Access
  {
    Monday: { open: '00:00', close: '23:59' },
    Tuesday: { open: '00:00', close: '23:59' },
    Wednesday: { open: '00:00', close: '23:59' },
    Thursday: { open: '00:00', close: '23:59' },
    Friday: { open: '00:00', close: '23:59' },
    Saturday: { open: '00:00', close: '23:59' },
    Sunday: { open: '00:00', close: '23:59' }
  },
  // Closed on Wednesday
  {
    Monday: { open: '08:00', close: '18:00' },
    Tuesday: { open: '08:00', close: '18:00' },
    Wednesday: 'Closed',
    Thursday: { open: '08:00', close: '18:00' },
    Friday: { open: '08:00', close: '18:00' },
    Saturday: 'Closed',
    Sunday: 'Closed'
  }
];

// Mock photos for workspaces
const workspacePhotos = [
  [
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094'
  ],
  [
    'https://images.unsplash.com/photo-1531973576160-7125cd663d86',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
    'https://images.unsplash.com/photo-1564069114553-7215e1ff1890'
  ],
  [
    'https://images.unsplash.com/photo-1556761175-b413da4baf72',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7',
    'https://images.unsplash.com/photo-1556761175-129418e5a8a0'
  ],
  [
    'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d',
    'https://images.unsplash.com/photo-1600494603346-488734b176e9',
    'https://images.unsplash.com/photo-1600607687644-c7f34b5f2f97'
  ],
  [
    'https://images.unsplash.com/photo-1520881363902-a0ff4e722963',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36',
    'https://images.unsplash.com/photo-1505409859467-3a796fd5798e'
  ]
];

// City coordinates for accurate mapping
const cityCoordinates = {
  'Enschede': { lat: 52.2215, lon: 6.8937 },
  'Hengelo': { lat: 52.2661, lon: 6.7938 },
  'Almelo': { lat: 52.3570, lon: 6.6686 }
};

// Generate a random workspace listing
function generateWorkspace() {
  // Determine the type of space and name accordingly
  const workspaceType = randomItem(workspaceTypes);
  let title;
  let nameType;
  
  // Generate a name based on the type of space
  const nameTypeRoll = Math.random();
  if (nameTypeRoll < 0.4) {
    // Coworking space
    title = randomItem(coworkingNames);
    nameType = 'coworking';
  } else if (nameTypeRoll < 0.6) {
    // Coffee house
    title = randomItem(coffeeHouseNames);
    nameType = 'coffee';
  } else {
    // Company
    title = randomItem(companyNames);
    nameType = 'company';
  }
  
  // Add workspace type to title for clarity
  if (workspaceType === SpaceType.DESK) {
    title += ' - Single Desk';
  } else if (workspaceType === SpaceType.OFFICE) {
    title += ' - Private Office';
  } else if (workspaceType === SpaceType.MEETING_ROOM) {
    title += ' - Meeting Room';
  } else if (workspaceType === SpaceType.EVENT_SPACE) {
    title += ' - Event Space';
  }
  
  // Generate location details
  const city = randomItem(cities);
  const streetName = randomItem(streetNames);
  const streetNumber = randomInt(1, 150);
  const postalCode = `${randomInt(7000, 7999)} ${String.fromCharCode(65 + randomInt(0, 25))}${String.fromCharCode(65 + randomInt(0, 25))}`;
  const address = `${streetName} ${streetNumber}`;
  
  // Generate coordinates with small random offset from city center
  const baseLat = cityCoordinates[city].lat;
  const baseLon = cityCoordinates[city].lon;
  const latOffset = (Math.random() - 0.5) * 0.02; // Approx 1-2 km offset
  const lonOffset = (Math.random() - 0.5) * 0.03;
  const coordinates = {
    lat: baseLat + latOffset,
    lon: baseLon + lonOffset
  };
  
  // Generate pricing
  const basePrice = randomPrice(15, 50); // Base price per day
  const pricePerDay = basePrice;
  const pricePerThreeDays = basePrice * 3 * 0.9; // 10% discount for 3 days
  const pricePerWeek = basePrice * 5 * 0.8; // 20% discount for a week
  const pricePerMonth = basePrice * 20 * 0.7; // 30% discount for a month (assuming ~20 working days)
  
  // Generate amenities
  const amenities = [...basicAmenities]; // Start with basic amenities
  
  // Add 3-8 random additional amenities
  const additionalCount = randomInt(3, 8);
  const shuffledAdditional = [...additionalAmenities].sort(() => 0.5 - Math.random());
  amenities.push(...shuffledAdditional.slice(0, additionalCount));
  
  // Generate availability
  const availability = randomItem(availabilityPatterns);
  
  // Generate workspace details based on type
  let workspaceDetails = {};
  if (workspaceType === SpaceType.DESK) {
    workspaceDetails = {
      capacity: 1,
      deskType: randomItem(['Standing Desk', 'Regular Desk', 'Adjustable Height Desk']),
      chairType: randomItem(['Ergonomic Chair', 'Standard Chair', 'Executive Chair']),
      monitors: randomItem([0, 1, 2])
    };
  } else if (workspaceType === SpaceType.OFFICE) {
    workspaceDetails = {
      capacity: randomInt(2, 10),
      desks: randomInt(2, 10),
      privateRoom: true,
      windowView: Math.random() > 0.3
    };
  } else if (workspaceType === SpaceType.MEETING_ROOM) {
    workspaceDetails = {
      capacity: randomInt(4, 20),
      tables: randomInt(1, 4),
      projector: Math.random() > 0.3,
      whiteboard: Math.random() > 0.2,
      videoConferencing: Math.random() > 0.5
    };
  } else if (workspaceType === SpaceType.EVENT_SPACE) {
    workspaceDetails = {
      capacity: randomInt(20, 100),
      standingCapacity: randomInt(30, 150),
      stage: Math.random() > 0.5,
      audioSystem: Math.random() > 0.3,
      cateringOption: Math.random() > 0.4
    };
  }
  
  // Generate building context
  const buildingContext = {
    buildingType: randomItem(['Modern Office', 'Converted Warehouse', 'Historic Building', 'Retail Space', 'Corporate Tower']),
    floor: randomInt(0, 10),
    elevator: Math.random() > 0.2,
    accessibility: Math.random() > 0.3,
    nearbyFacilities: []
  };
  
  // Add nearby facilities
  const nearbyOptions = ['Restaurants', 'Cafes', 'Shops', 'Public Transport', 'Parking', 'Park', 'Gym'];
  const nearbyCount = randomInt(1, 4);
  const shuffledNearby = [...nearbyOptions].sort(() => 0.5 - Math.random());
  buildingContext.nearbyFacilities = shuffledNearby.slice(0, nearbyCount);
  
  // Generate host information
  const hostNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Jamie', 'Riley', 'Quinn', 'Avery'];
  const hostName = randomItem(hostNames) + ' ' + String.fromCharCode(65 + randomInt(0, 25)) + '.';
  const responseOptions = ['within an hour', 'within a few hours', 'within a day', 'within 2 days'];
  
  // Generate description based on workspace type and amenities
  let description = '';
  if (nameType === 'coworking') {
    description = `Welcome to ${title.split(' - ')[0]}, a modern coworking space in the heart of ${city}. `;
  } else if (nameType === 'coffee') {
    description = `${title.split(' - ')[0]} offers a unique blend of great coffee and productive workspace in ${city}. `;
  } else {
    description = `${title.split(' - ')[0]} provides professional workspace solutions in our ${city} location. `;
  }
  
  if (workspaceType === SpaceType.DESK) {
    description += `This dedicated desk provides everything you need for a productive day of work. `;
  } else if (workspaceType === SpaceType.OFFICE) {
    description += `Our private office space is perfect for teams looking for a dedicated, distraction-free environment. `;
  } else if (workspaceType === SpaceType.MEETING_ROOM) {
    description += `This professional meeting room is ideal for client presentations, team meetings, and collaborative sessions. `;
  } else if (workspaceType === SpaceType.EVENT_SPACE) {
    description += `Our versatile event space can be configured to host a variety of events, from workshops to networking sessions. `;
  }
  
  description += `\n\nAmenities include ${amenities.slice(0, 3).join(', ')}, and more. `;
  
  if (buildingContext.nearbyFacilities.length > 0) {
    description += `\n\nThe building is conveniently located near ${buildingContext.nearbyFacilities.join(', ')}. `;
  }
  
  description += `\n\nAvailable at competitive rates with flexible booking options.`;
  
  // Generate photos
  const photos = randomItem(workspacePhotos);
  
  return {
    title,
    description,
    workspaceType,
    address,
    city,
    postalCode,
    country: 'Netherlands',
    coordinates,
    directions: `Located on ${streetName}, easily accessible from the city center.`,
    transportInfo: `Public transport stops within 5 minutes walking distance. ${Math.random() > 0.5 ? 'Train station nearby.' : 'Bus stops nearby.'}`,
    parkingInfo: Math.random() > 0.3 ? 'Free parking available on-site.' : 'Paid parking available nearby.',
    buildingContext,
    workspaceDetails,
    amenities,
    photos,
    availability,
    pricePerDay,
    pricePerThreeDays,
    pricePerWeek,
    pricePerMonth,
    hostName,
    hostEmail: `${hostName.split(' ')[0].toLowerCase()}@${title.split(' - ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    hostPhone: `+31 6 ${randomInt(10000000, 99999999)}`,
    preferredContact: randomItem(['email', 'phone']),
    responseTime: randomItem(responseOptions),
    hostInfo: `${hostName} has been managing this workspace since ${2020 + randomInt(0, 4)} and is known for providing excellent service to clients.`
  };
}

async function main() {
  try {
    // Get the admin user (or create one if it doesn't exist)
    let adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@example.com'
      }
    });
    
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          hashedPassword: '$2a$10$GILjzxX2zJxQY1l.8SkMBuRrYUZFa9OVBFKmFgU6s0QQQEQQEQQEq', // dummy hashed password
          image: 'https://randomuser.me/api/portraits/lego/1.jpg'
        }
      });
      console.log('Created admin user');
    } else {
      console.log('Using existing admin user');
    }
    
    // Delete all existing spaces
    const { count } = await prisma.space.deleteMany({});
    console.log(`Deleted ${count} existing spaces`);
    
    // Create 20 new workspace listings
    const workspaces = [];
    for (let i = 0; i < 20; i++) {
      const workspaceData = generateWorkspace();
      const workspace = await prisma.space.create({
        data: {
          ...workspaceData,
          // Convert complex objects to JSON strings
          coordinates: JSON.stringify(workspaceData.coordinates),
          buildingContext: JSON.stringify(workspaceData.buildingContext),
          workspaceDetails: JSON.stringify(workspaceData.workspaceDetails),
          amenities: JSON.stringify(workspaceData.amenities),
          photos: JSON.stringify(workspaceData.photos),
          availability: JSON.stringify(workspaceData.availability),
          // Link to admin user
          ownerId: adminUser.id
        }
      });
      workspaces.push(workspace);
      console.log(`Created workspace: ${workspace.title}`);
    }
    
    console.log('Database seeded successfully with 20 workspace listings');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
