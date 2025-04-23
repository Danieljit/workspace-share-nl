"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

// Import Leaflet types without importing the actual library (which is loaded dynamically)
type LeafletType = any;
declare global {
  interface Window {
    L: LeafletType;
  }
}

interface LocationMarker {
  id: string
  name: string
  location: string
  price?: number
  type?: string
  images?: string[]
  selected?: boolean
}

interface MapProps {
  location?: string
  locations?: LocationMarker[]
  className?: string
  onMarkerClick?: (id: string) => void
  coordinates?: { lat: number; lon: number } | null
}

// Define the ref type for the Map component
export interface MapRef {
  mapInstance: any | null;
  fitBounds: () => void;
}

// Dutch city coordinates to avoid geocoding timeouts
const dutchCityCoords: {[key: string]: {lat: number, lon: number}} = {
  'Amsterdam': { lat: 52.3676, lon: 4.9041 },
  'Rotterdam': { lat: 51.9244, lon: 4.4777 },
  'Utrecht': { lat: 52.0907, lon: 5.1214 },
  'Eindhoven': { lat: 51.4416, lon: 5.4697 },
  'Groningen': { lat: 53.2194, lon: 6.5665 },
  'The Hague': { lat: 52.0705, lon: 4.3007 },
  'Den Haag': { lat: 52.0705, lon: 4.3007 }, // Alternative name for The Hague
  'Maastricht': { lat: 50.8513, lon: 5.6909 },
  'Delft': { lat: 52.0116, lon: 4.3571 },
  'Leiden': { lat: 52.1601, lon: 4.4970 },
  'Haarlem': { lat: 52.3873, lon: 4.6462 },
  'Nijmegen': { lat: 51.8425, lon: 5.8372 },
  'Tilburg': { lat: 51.5719, lon: 5.0672 },
  'Breda': { lat: 51.5719, lon: 4.7683 },
  'Enschede': { lat: 52.2215, lon: 6.8937 },
  'Arnhem': { lat: 51.9851, lon: 5.8987 },
  'Amersfoort': { lat: 52.1561, lon: 5.3878 },
  'Apeldoorn': { lat: 52.2112, lon: 5.9699 },
  'Zwolle': { lat: 52.5168, lon: 6.0830 },
  'Almere': { lat: 52.3508, lon: 5.2647 },
  'Alkmaar': { lat: 52.6324, lon: 4.7533 },
  'Venlo': { lat: 51.3704, lon: 6.1723 }
}

// Default to Amsterdam if no match found
const defaultCoords = { lat: 52.3676, lon: 4.9041 }

// Helper function to find coordinates for a location string
const findCoordsForLocation = (locationString: string) => {
  if (!locationString) return defaultCoords;
  
  const normalizedLocation = locationString.toLowerCase();
  
  for (const [city, cityCoords] of Object.entries(dutchCityCoords)) {
    if (normalizedLocation.includes(city.toLowerCase())) {
      return cityCoords;
    }
  }
  
  return defaultCoords;
}

// Create a client-side only version of the Map component
const MapComponent = forwardRef<MapRef, MapProps>(({ location, locations = [], className, onMarkerClick, coordinates }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any | null>(null)
  const markersRef = useRef<{[key: string]: any}>({})
  const popupsRef = useRef<{[key: string]: any}>({})
  const markerClusterRef = useRef<any | null>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  
  // Load Leaflet dynamically on the client side
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        try {
          // Import Leaflet dynamically
          const L = await import('leaflet');
          window.L = L;
          
          // Add Leaflet CSS manually instead of importing it
          const linkElement = document.createElement('link');
          linkElement.rel = 'stylesheet';
          linkElement.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
          document.head.appendChild(linkElement);
          
          // Import MarkerCluster with better error handling
          try {
            // First add MarkerCluster CSS
            const clusterCss = document.createElement('link');
            clusterCss.rel = 'stylesheet';
            clusterCss.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
            document.head.appendChild(clusterCss);
            
            const clusterDefaultCss = document.createElement('link');
            clusterDefaultCss.rel = 'stylesheet';
            clusterDefaultCss.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css';
            document.head.appendChild(clusterDefaultCss);
            
            // Then import the MarkerCluster script
            await import('leaflet.markercluster');
            console.log('MarkerCluster loaded successfully');
          } catch (error) {
            console.error('Error loading MarkerCluster:', error instanceof Error ? error.message : 'Unknown error');
            // Continue without clustering functionality
          }
          
          // Force a re-render
          setLeafletLoaded(true);
        } catch (error) {
          console.error('Error loading Leaflet:', error instanceof Error ? error.message : 'Unknown error');
        }
      } else if (window.L) {
        setLeafletLoaded(true);
      }
    };
    
    loadLeaflet();
  }, [])
  
  // Expose map instance to parent component
  useImperativeHandle(ref, () => ({
    mapInstance: mapInstanceRef.current,
    fitBounds: () => {
      if (mapInstanceRef.current && window.L && Object.keys(markersRef.current).length > 0) {
        const group = window.L.featureGroup(Object.values(markersRef.current))
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] })
      }
    }
  }))

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !leafletLoaded) return
    
    // Fix Leaflet default icon path issues
    delete (window.L.Icon.Default.prototype as any)._getIconUrl
    window.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    })

    // Initialize the map
    mapInstanceRef.current = window.L.map(mapRef.current).setView([52.1326, 5.2913], 7) // Center of Netherlands

    // Add OpenStreetMap tiles
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: ' OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current)
    
    // Create marker cluster group if available
    if (window.L.markerClusterGroup) {
      try {
        markerClusterRef.current = window.L.markerClusterGroup({
          showCoverageOnHover: true,
          zoomToBoundsOnClick: true,
          spiderfyOnMaxZoom: true,
          removeOutsideVisibleBounds: true,
          disableClusteringAtZoom: 18, // Show individual markers at high zoom levels
          maxClusterRadius: 80 // Distance in pixels within which markers will be clustered
        });
        
        mapInstanceRef.current.addLayer(markerClusterRef.current);
        console.log('MarkerCluster group created successfully');
      } catch (error) {
        console.error('Error creating marker cluster group:', error instanceof Error ? error.message : 'Unknown error');
        // Continue without clustering
      }
    } else {
      console.warn('MarkerClusterGroup not available - markers will not be clustered');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [leafletLoaded])

  // Handle single location
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletLoaded || (!location && !coordinates) || locations.length > 0) return

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.remove()
    })
    markersRef.current = {}
    
    // Use precise coordinates if available, otherwise use location string
    let latitude, longitude
    
    if (coordinates && 'lat' in coordinates && 'lon' in coordinates) {
      // Use precise coordinates
      latitude = coordinates.lat
      longitude = coordinates.lon
      console.log('Using precise coordinates:', latitude, longitude)
    } else {
      // Use our helper function to find coordinates based on the location string
      const coords = findCoordsForLocation(location || '');
      latitude = coords.lat;
      longitude = coords.lon;
      console.log('Using approximate coordinates from location string:', latitude, longitude)
    }
    
    // Set the view to the coordinates
    mapInstanceRef.current.setView([latitude, longitude], 13);
    
    // Create a marker with a popup showing the actual address
    const marker = window.L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
    marker.bindPopup(`<div class="p-2"><strong>Address:</strong><br>${location || 'Location'}</div>`).openPopup();
    
  }, [location, coordinates, locations.length, leafletLoaded])

  // Handle multiple locations
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletLoaded || !locations.length) return

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.remove()
    })
    markersRef.current = {}
    popupsRef.current = {}

    // Track bounds to fit map
    const latLngs: any[] = []
    
    // Clear marker cluster if it exists
    if (markerClusterRef.current) {
      markerClusterRef.current.clearLayers();
    }
    
    // Create stapler icon
    const staplerIcon = window.L.divIcon({
      className: 'custom-stapler-marker',
      html: `<div class="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-51.2 -51.2 614.40 614.40" class="w-10 h-10">
                <path style="fill:#E6E7E8;" d="M460.014,266.268l-370.739,48.83l0,0c-5.89-45.853,25.329-87.766,69.729-93.613l247.365-32.581 c23.738-3.127,45.533,14.212,48.682,38.726L460.014,266.268z"></path>
                <path style="fill:#ee5d5d;" d="M470.312,341.726H74.297c-25.89,0-50.249,12.661-65.671,34.132l0,0h494.744l0,0 C503.371,357.007,488.57,341.726,470.312,341.726z"></path>
                <path style="fill:#cb4343;" d="M470.312,341.726h-56.756c18.258,0,33.059,15.282,33.059,34.132l0,0h56.756l0,0 C503.372,357.007,488.57,341.726,470.312,341.726z"></path>
                <path style="fill:#BCBEC0;" d="M455.051,227.631c-3.149-24.514-24.944-41.853-48.682-38.726l-247.365,32.58 c-44.4,5.848-75.619,47.76-69.729,93.613l0,0l54.123-7.128l312.737-71.9L455.051,227.631z"></path>
                <path style="fill:#ee5d5d;" d="M485.383,209.212L28.571,314.236l0,0c-9.733-45.128,17.81-89.858,61.52-99.908l335.357-77.101 c23.368-5.373,46.529,9.831,51.733,33.958L485.383,209.212z"></path>
                <path style="fill:#cb4343;" d="M485.383,209.212l-8.202-38.026c-5.204-24.126-28.366-39.33-51.734-33.958l-9.744,2.24 c6.79,6.065,11.823,14.351,13.925,24.095l0,0c4.548,21.085-8.689,41.91-29.711,46.743l-373.28,85.82 c0.012,5.974,0.625,12.037,1.934,18.109l0,0L485.383,209.212z"></path>
                <circle style="fill:#e89696;" cx="106.958" cy="306.61" r="41.417"></circle>
              </svg>
            </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
    
    // Process each location
    locations.forEach(loc => {
      // Use our helper function to find coordinates based on the location string
      const coords = findCoordsForLocation(loc.location);
      
      const latitude = coords.lat;
      const longitude = coords.lon;
      
      // Create marker with stapler icon
      const marker = window.L.marker([latitude, longitude], {
        icon: staplerIcon,
        riseOnHover: true
      });
      
      // Store marker reference
      markersRef.current[loc.id] = marker;
      
      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 space-y-2';
      
      // Add image if available
      if (loc.images && loc.images.length > 0) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'relative w-full h-24 rounded-md overflow-hidden';
        
        const img = document.createElement('img');
        img.src = loc.images[0];
        img.alt = loc.name;
        img.className = 'object-cover w-full h-full';
        
        imageContainer.appendChild(img);
        popupContent.appendChild(imageContainer);
      }
      
      // Add name and info
      const nameElement = document.createElement('div');
      nameElement.innerHTML = `<strong class="text-sm">${loc.name}</strong>`;
      popupContent.appendChild(nameElement);
      
      const infoElement = document.createElement('div');
      infoElement.className = 'text-xs text-muted-foreground';
      infoElement.innerHTML = `${loc.type || 'Workspace'} · €${loc.price || '??'}/day`;
      popupContent.appendChild(infoElement);
      
      // Add button if click handler provided
      if (onMarkerClick) {
        const button = document.createElement('button');
        button.className = 'mt-2 text-xs bg-primary text-white px-2 py-1 rounded-md w-full';
        button.innerText = 'View Details';
        button.onclick = () => {
          onMarkerClick(loc.id);
        };
        
        popupContent.appendChild(button);
      }
      
      // Create and bind popup
      const popup = window.L.popup({
        offset: window.L.point(0, -20),
        closeButton: false,
        className: 'custom-popup'
      }).setContent(popupContent);
      
      // Store popup reference
      popupsRef.current[loc.id] = popup;
      
      // Bind popup to marker
      marker.bindPopup(popup);
      
      // Add event listeners
      marker.on('mouseover', () => {
        marker.openPopup();
      });
      
      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(loc.id);
        }
      });
      
      // Add to bounds
      latLngs.push([latitude, longitude]);
      
      // Add to cluster if available, otherwise add directly to map
      if (markerClusterRef.current) {
        markerClusterRef.current.addLayer(marker);
      } else {
        marker.addTo(mapInstanceRef.current);
      }
    });
    
    // Fit map to bounds if we have locations
    if (latLngs.length > 0) {
      try {
        // Create a bounds object
        const bounds = window.L.latLngBounds(latLngs);
        
        // Fit the map to these bounds
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15
        });
      } catch (error) {
        console.error('Error fitting bounds:', error);
        // Fallback to center of Netherlands
        mapInstanceRef.current.setView([52.1326, 5.2913], 7);
      }
    }
  }, [locations, leafletLoaded, onMarkerClick])

  return (
    <div 
      ref={mapRef} 
      className={cn("h-full w-full bg-muted rounded-md overflow-hidden", className)}
    >
      {!leafletLoaded && (
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  )
})

// Export a dynamic version that only loads on the client
export const Map = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted rounded-md flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
}) as typeof MapComponent
