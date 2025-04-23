'use client';

import { useState } from 'react';
import { useRef } from 'react';

// Import animated icons
import { AirplaneIcon, type AirplaneIconHandle } from './airplane';
import { BellIcon, type BellIconHandle } from './bell';
import { CalendarCheckIcon, type CalendarCheckIconHandle } from './calendar-check';
import { CalendarDaysIcon, type CalendarDaysIconHandle } from './calendar-days';
import { CartIcon, type CartIconHandle } from './cart';
import { CoffeeIcon, type CoffeeIconHandle } from './coffee';
import { HomeIcon, type HomeIconHandle } from './home';
import { MapPinIcon, type MapPinIconHandle } from './map-pin';
import { MessageSquareIcon, type MessageSquareIconHandle } from './message-square';
import { SearchIcon, type SearchIconHandle } from './search';
import { SettingsIcon, type SettingsIconHandle } from './settings';
import { SmartphoneChargingIcon, type SmartphoneChargingIconHandle } from './smartphone-charging';
import { SquareActivityIcon, type SquareActivityIconHandle } from './square-activity';
import { UserIcon, type UserIconHandle } from './user';
import { WifiIcon, type WifiIconHandle } from './wifi';

type IconInfo = {
  name: string;
  component: React.ComponentType<any>;
  category: 'workspace' | 'user' | 'booking' | 'interaction' | 'misc';
  description: string;
};

const icons: IconInfo[] = [
  // Workspace related
  { 
    name: 'Coffee', 
    component: CoffeeIcon, 
    category: 'workspace',
    description: 'Perfect for co-working spaces and cafes'
  },
  { 
    name: 'Home', 
    component: HomeIcon, 
    category: 'workspace',
    description: 'Represents home office or remote work'
  },
  { 
    name: 'Map Pin', 
    component: MapPinIcon, 
    category: 'workspace',
    description: 'For location-based features and maps'
  },
  { 
    name: 'Wifi', 
    component: WifiIcon, 
    category: 'workspace',
    description: 'Indicates internet connectivity in workspaces'
  },
  
  // User related
  { 
    name: 'User', 
    component: UserIcon, 
    category: 'user',
    description: 'For user profiles and account management'
  },
  { 
    name: 'Settings', 
    component: SettingsIcon, 
    category: 'user',
    description: 'For configuration and preferences'
  },
  
  // Booking related
  { 
    name: 'Calendar Days', 
    component: CalendarDaysIcon, 
    category: 'booking',
    description: 'For date selection and calendar views'
  },
  { 
    name: 'Calendar Check', 
    component: CalendarCheckIcon, 
    category: 'booking',
    description: 'For confirmed bookings and events'
  },
  
  // Interaction
  { 
    name: 'Search', 
    component: SearchIcon, 
    category: 'interaction',
    description: 'For search functionality'
  },
  { 
    name: 'Bell', 
    component: BellIcon, 
    category: 'interaction',
    description: 'For notifications and alerts'
  },
  { 
    name: 'Message Square', 
    component: MessageSquareIcon, 
    category: 'interaction',
    description: 'For messaging and comments'
  },
  
  // Misc
  { 
    name: 'Airplane', 
    component: AirplaneIcon, 
    category: 'misc',
    description: 'For travel-related features'
  },
  { 
    name: 'Cart', 
    component: CartIcon, 
    category: 'misc',
    description: 'For shopping or booking cart'
  },
  { 
    name: 'Square Activity', 
    component: SquareActivityIcon, 
    category: 'misc',
    description: 'For activity tracking and analytics'
  },
  { 
    name: 'Smartphone Charging', 
    component: SmartphoneChargingIcon, 
    category: 'misc',
    description: 'For mobile features and charging stations'
  },
];

export function AnimatedIconsShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [controlledIcon, setControlledIcon] = useState<string | null>(null);
  
  // Refs for controlled animations
  const iconRefs = useRef<Record<string, any>>({});
  
  const filteredIcons = selectedCategory === 'all' 
    ? icons 
    : icons.filter(icon => icon.category === selectedCategory);
  
  const handleStartAnimation = (iconName: string) => {
    if (iconRefs.current[iconName]) {
      iconRefs.current[iconName].startAnimation();
      setControlledIcon(iconName);
    }
  };
  
  const handleStopAnimation = (iconName: string) => {
    if (iconRefs.current[iconName]) {
      iconRefs.current[iconName].stopAnimation();
      setControlledIcon(null);
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Animated Icons Showcase</h2>
      
      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Filter by Category:</h3>
        <div className="flex flex-wrap gap-2">
          {['all', 'workspace', 'user', 'booking', 'interaction', 'misc'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm ${selectedCategory === category 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Icons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredIcons.map((icon) => {
          const IconComponent = icon.component;
          return (
            <div key={icon.name} className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="mb-2 h-16 flex items-center justify-center">
                <IconComponent 
                  ref={(ref: any) => iconRefs.current[icon.name] = ref} 
                  size={36} 
                  className="text-primary"
                />
              </div>
              <h3 className="font-medium text-center">{icon.name}</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">{icon.description}</p>
              
              <div className="mt-4 flex gap-2">
                {controlledIcon === icon.name ? (
                  <button 
                    onClick={() => handleStopAnimation(icon.name)}
                    className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded"
                  >
                    Stop
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStartAnimation(icon.name)}
                    className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded"
                  >
                    Animate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
