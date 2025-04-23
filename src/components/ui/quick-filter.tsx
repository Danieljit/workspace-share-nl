'use client';

import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Import animated icons
import { CoffeeIcon } from './coffee';
import { HomeIcon } from './home';
import { MapPinIcon } from './map-pin';
import { WifiIcon } from './wifi';
import { UserIcon } from './user';
import { SettingsIcon } from './settings';
import { CalendarDaysIcon } from './calendar-days';
import { CalendarCheckIcon } from './calendar-check';
import { SearchIcon } from './search';
import { BellIcon } from './bell';
import { MessageSquareIcon } from './message-square';
import { AirplaneIcon } from './airplane';
import { CartIcon } from './cart';
import { SquareActivityIcon } from './square-activity';
import { SmartphoneChargingIcon } from './smartphone-charging';

type FilterCategory = {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
};

const filterCategories: FilterCategory[] = [
  { id: 'all', name: 'All', icon: SearchIcon },
  { id: 'desk', name: 'Single Desk', icon: HomeIcon },
  { id: 'office', name: 'Private Office', icon: SettingsIcon },
  { id: 'meeting', name: 'Meeting Room', icon: MessageSquareIcon },
  { id: 'coworking', name: 'Co-Working', icon: CoffeeIcon },
  { id: 'wifi', name: 'Free Wifi', icon: WifiIcon },
  { id: 'city-center', name: 'City Center', icon: MapPinIcon },
  { id: 'parking', name: 'Parking', icon: CartIcon },
  { id: 'events', name: 'Events', icon: CalendarDaysIcon },
  { id: 'quiet', name: 'Quiet Space', icon: BellIcon },
  { id: 'accessible', name: 'Accessible', icon: UserIcon },
  { id: 'pet-friendly', name: 'Pet Friendly', icon: AirplaneIcon },
  { id: '24-hours', name: '24 Hours', icon: CalendarCheckIcon },
  { id: 'food', name: 'Food & Drinks', icon: CoffeeIcon },
  { id: 'printing', name: 'Printing', icon: SquareActivityIcon },
  { id: 'charging', name: 'Charging', icon: SmartphoneChargingIcon },
];

interface QuickFilterProps {
  onFilterChange?: (filterId: string) => void;
  className?: string;
}

export function QuickFilter({ onFilterChange, className }: QuickFilterProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftGradient(scrollLeft > 10);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Check initial state
      handleScroll();
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  const handleFilterClick = (filterId: string) => {
    setSelectedFilter(filterId);
    if (onFilterChange) {
      onFilterChange(filterId);
    }
  };
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  return (
    <div className={cn("relative", className)}>
      {/* Left Gradient Fade */}
      {showLeftGradient && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 flex items-center justify-start pl-1"
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 hover:opacity-100 transition-opacity">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      )}
      
      {/* Filter Categories */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide py-4 px-1 gap-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filterCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => handleFilterClick(category.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[72px] transition-all duration-200",
                selectedFilter === category.id 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-3 rounded-full mb-1 transition-colors",
                selectedFilter === category.id 
                  ? "bg-primary/10" 
                  : "bg-transparent"
              )}>
                <IconComponent size={24} />
              </div>
              <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
            </button>
          );
        })}
      </div>
      
      {/* Right Gradient Fade */}
      {showRightGradient && (
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 flex items-center justify-end pr-1"
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 hover:opacity-100 transition-opacity">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Add a CSS class to hide scrollbars
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;
  document.head.appendChild(style);
}
