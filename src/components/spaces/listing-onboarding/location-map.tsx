"use client"

import { useEffect, useRef, useState } from "react"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import { MapPin } from "lucide-react"

type LocationMapProps = {
  initialPosition?: { lat: number; lng: number };
  onPositionChange?: (lat: number, lng: number) => void;
  multipleMarkers?: { lat: number; lng: number }[];
  readOnly?: boolean;
}

export default function LocationMap({ 
  initialPosition = { lat: 52.3676, lng: 4.9041 }, // Default to Amsterdam
  onPositionChange,
  multipleMarkers = [],
  readOnly = false
}: LocationMapProps) {
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const markerClusterRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mapInitialized, setMapInitialized] = useState(false)
  const hasInitializedRef = useRef(false) // Track initialization to prevent double init
  
  // Initialize map only once when component mounts
  useEffect(() => {
    // Prevent double initialization
    if (hasInitializedRef.current) return;
    
    // Dynamically import Leaflet only on the client side
    const initializeMap = async () => {
      if (!mapRef.current && containerRef.current && !mapInitialized) {
        try {
          hasInitializedRef.current = true; // Mark as initialized to prevent double init
          
          // Dynamically import Leaflet
          const L = (await import('leaflet')).default;
          await import('leaflet.markercluster');
          
          // Make sure the map container has dimensions
          if (containerRef.current.clientHeight === 0) {
            containerRef.current.style.height = '300px';
          }
          
          // Create map instance
          mapRef.current = L.map(containerRef.current).setView(
            [initialPosition.lat, initialPosition.lng],
            13
          )

          // Add OpenStreetMap tiles
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(mapRef.current)

          // Create custom pin icon
          const pinIcon = L.divIcon({
            className: "custom-map-marker",
            html: `<div class="flex items-center justify-center w-10 h-10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 text-primary drop-shadow-md">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
          })

          // Create marker cluster group
          markerClusterRef.current = L.markerClusterGroup({
            showCoverageOnHover: true,
            zoomToBoundsOnClick: true,
            spiderfyOnMaxZoom: true,
            removeOutsideVisibleBounds: true,
            disableClusteringAtZoom: 18, // Show individual markers at high zoom levels
            maxClusterRadius: 80 // Distance in pixels within which markers will be clustered
          });
          
          mapRef.current.addLayer(markerClusterRef.current);

          // Add main marker if not in read-only mode
          if (!readOnly) {
            // Add draggable marker for the main location
            markerRef.current = L.marker([initialPosition.lat, initialPosition.lng], {
              icon: pinIcon,
              draggable: true,
            }).addTo(mapRef.current)

            // Handle marker drag events
            markerRef.current.on("dragend", function (e: any) {
              const marker = e.target
              const position = marker.getLatLng()
              if (onPositionChange) {
                onPositionChange(position.lat, position.lng)
              }
            })
          }
          
          // Add multiple markers if provided
          if (multipleMarkers && multipleMarkers.length > 0) {
            multipleMarkers.forEach((position) => {
              const marker = L.marker([position.lat, position.lng], {
                icon: pinIcon,
                draggable: false
              });
              
              markerClusterRef.current.addLayer(marker);
            });
            
            // If we have multiple markers, fit the map to show all of them
            if (multipleMarkers.length > 1) {
              const group = L.featureGroup(multipleMarkers.map(pos => 
                L.marker([pos.lat, pos.lng])
              ));
              mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
            }
          }
          
          // Force a resize after map is created to ensure it renders correctly
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
            }
          }, 100);
          
          setMapInitialized(true)
        } catch (error) {
          console.error("Error initializing map:", error)
          hasInitializedRef.current = false; // Reset if initialization fails
        }
      }
    };
    
    initializeMap();

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
        markerClusterRef.current = null
        setMapInitialized(false)
        hasInitializedRef.current = false; // Reset on cleanup
      }
    }
  }, []) // Remove containerRef.current from dependencies to prevent re-initialization

  // Update marker position if coordinates change
  useEffect(() => {
    if (markerRef.current && mapRef.current && initialPosition && mapInitialized && !readOnly) {
      try {
        markerRef.current.setLatLng([initialPosition.lat, initialPosition.lng])
        mapRef.current.setView([initialPosition.lat, initialPosition.lng], mapRef.current.getZoom())
      } catch (error) {
        console.error("Error updating marker position:", error)
      }
    }
  }, [initialPosition, mapInitialized, readOnly])
  
  // Add event listener to handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Call once to ensure map is sized correctly
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mapInitialized]);

  return (
    <div ref={containerRef} className="h-full w-full" style={{ minHeight: '300px' }}>
      {!mapInitialized && (
        <div className="flex items-center justify-center h-full w-full bg-gray-100">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  )
}
