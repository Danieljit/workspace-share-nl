"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin } from "lucide-react"

type LocationMapProps = {
  initialPosition?: { lat: number; lng: number };
  onPositionChange?: (lat: number, lng: number) => void;
}

export default function LocationMap({ 
  initialPosition = { lat: 52.3676, lng: 4.9041 }, // Default to Amsterdam
  onPositionChange 
}: LocationMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  
  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      // Create map instance
      mapRef.current = L.map("location-map").setView(
        [initialPosition.lat, initialPosition.lng],
        13
      )

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Create custom icon
      const customIcon = L.divIcon({
        className: "custom-map-marker",
        html: `<div class="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      // Add marker
      markerRef.current = L.marker([initialPosition.lat, initialPosition.lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(mapRef.current)

      // Handle marker drag events
      markerRef.current.on("dragend", function (e) {
        const marker = e.target
        const position = marker.getLatLng()
        if (onPositionChange) {
          onPositionChange(position.lat, position.lng)
        }
      })
    }

    // Update marker position if coordinates change
    if (markerRef.current && mapRef.current && initialPosition) {
      markerRef.current.setLatLng([initialPosition.lat, initialPosition.lng])
      mapRef.current.setView([initialPosition.lat, initialPosition.lng], mapRef.current.getZoom())
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [initialPosition, onPositionChange])

  return (
    <div id="location-map" className="h-full w-full">
      {/* Map will be rendered here */}
    </div>
  )
}
