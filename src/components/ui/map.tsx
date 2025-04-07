"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

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
}

// Define the ref type for the Map component
export interface MapRef {
  mapInstance: any | null;
  fitBounds: () => void;
}

// Create a client-side only version of the Map component
const MapComponent = forwardRef<MapRef, MapProps>(({ location, locations = [], className, onMarkerClick }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any | null>(null)
  const markersRef = useRef<{[key: string]: any}>({})
  const popupsRef = useRef<{[key: string]: any}>({})
  const [L, setL] = useState<any>(null)
  
  // Load Leaflet dynamically only on the client side
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const L = (await import('leaflet')).default
        // Load Leaflet CSS
        await import('leaflet/dist/leaflet.css')
        setL(L)
      } catch (error) {
        console.error('Error loading Leaflet:', error)
      }
    }
    
    loadLeaflet()
  }, [])
  
  // Expose map instance to parent component
  useImperativeHandle(ref, () => ({
    mapInstance: mapInstanceRef.current,
    fitBounds: () => {
      if (mapInstanceRef.current && L && Object.keys(markersRef.current).length > 0) {
        const group = L.featureGroup(Object.values(markersRef.current))
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] })
      }
    }
  }))

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !L) return
    
    // Fix Leaflet default icon path issues
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    })

    // Initialize the map
    mapInstanceRef.current = L.map(mapRef.current).setView([52.1326, 5.2913], 7) // Center of Netherlands

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: ' OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [L])

  // Handle single location
  useEffect(() => {
    if (!mapInstanceRef.current || !L || !location || locations.length > 0) return

    // Geocode the location
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
      .then(response => response.json())
      .then((data: Array<{ lat: string; lon: string }>) => {
        if (data && data[0] && mapInstanceRef.current) {
          const { lat, lon } = data[0]
          const latitude = parseFloat(lat)
          const longitude = parseFloat(lon)
          mapInstanceRef.current.setView([latitude, longitude], 13)
          L.marker([latitude, longitude]).addTo(mapInstanceRef.current)
        }
      })
  }, [location, locations.length, L])

  // Handle multiple locations
  useEffect(() => {
    if (!mapInstanceRef.current || !L || !locations.length) return

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.remove()
    })
    markersRef.current = {}
    popupsRef.current = {}

    // Track bounds to fit map
    const latLngs: any[] = []
    const geocodePromises = locations.map(loc => {
      return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc.location)}`)
        .then(response => response.json())
        .then((data: Array<{ lat: string; lon: string }>) => {
          if (data && data[0] && mapInstanceRef.current) {
            const { lat, lon } = data[0]
            const latitude = parseFloat(lat)
            const longitude = parseFloat(lon)
            
            // Create custom icon for markers
            const markerIcon = L.divIcon({
              className: 'custom-marker',
              html: `<div class="${loc.selected ? 'bg-primary' : 'bg-white'} text-${loc.selected ? 'white' : 'primary'} px-2 py-1 rounded-full shadow-lg font-medium text-sm flex items-center justify-center border-2 border-white">
                      €${loc.price || '??'}
                    </div>`,
              iconSize: [60, 30],
              iconAnchor: [30, 15]
            })
            
            // Create marker
            const marker = L.marker([latitude, longitude], { icon: markerIcon })
              .addTo(mapInstanceRef.current)
            
            // Create popup content
            const popupContent = document.createElement('div')
            popupContent.className = 'space-popup'
            popupContent.innerHTML = `
              <div class="flex flex-col w-48">
                <div class="relative h-24 w-full mb-2">
                  <img src="${loc.images?.[0] || '/placeholder.jpg'}" alt="${loc.name}" class="absolute inset-0 w-full h-full object-cover rounded-t-lg" />
                </div>
                <div class="p-2">
                  <h3 class="font-semibold text-sm">${loc.name}</h3>
                  <p class="text-xs text-gray-500">${loc.type || 'Workspace'}</p>
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-xs">${loc.location.split(',')[0]}</span>
                    <span class="font-medium">€${loc.price || '??'}/day</span>
                  </div>
                </div>
              </div>
            `
            
            // Create popup
            const popup = L.popup({
              offset: L.point(0, -15),
              closeButton: false,
              className: 'space-popup'
            }).setContent(popupContent)
            
            // Store references
            markersRef.current[loc.id] = marker
            popupsRef.current[loc.id] = popup
            
            // Add event listeners
            marker.on('click', () => {
              // Close all other popups
              Object.values(popupsRef.current).forEach(p => mapInstanceRef.current?.closePopup(p))
              
              // Open this popup
              marker.bindPopup(popup).openPopup()
              
              // Call onMarkerClick handler
              if (onMarkerClick) {
                onMarkerClick(loc.id)
              }
            })
            
            // If marker is selected, open its popup
            if (loc.selected) {
              marker.bindPopup(popup).openPopup()
            }
            
            latLngs.push(L.latLng(latitude, longitude))
          }
        })
    })

    // Wait for all geocoding to complete, then fit bounds
    Promise.all(geocodePromises).then(() => {
      if (mapInstanceRef.current && latLngs.length > 0) {
        const boundsGroup = L.featureGroup(Object.values(markersRef.current))
        mapInstanceRef.current.fitBounds(boundsGroup.getBounds(), { padding: [50, 50] })
      }
    })
  }, [locations, L, onMarkerClick])

  return (
    <div ref={mapRef} className={cn("h-full w-full rounded-md overflow-hidden", className)} />
  )
})

MapComponent.displayName = "MapComponent"

// Export a dynamic component that only loads on the client side
export const Map = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted rounded-md">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  )
}) as typeof MapComponent
