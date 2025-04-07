"use client"

import { useEffect, useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MapPin, Loader2, CheckCircle2 } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the map component to prevent SSR issues with Leaflet
const LocationMap = dynamic(
  () => import("../location-map"),
  { ssr: false }
)

type LocationStepProps = {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

type AddressSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    country?: string;
    country_code?: string;
    road?: string;
    house_number?: string;
  };
  class?: string;
  type?: string;
}

export function LocationStep({ formData, updateFormData }: LocationStepProps) {
  const [location, setLocation] = useState<Record<string, any>>(formData.location || {
    address: "",
    city: "",
    postalCode: "",
    country: "Netherlands",
    coordinates: { lat: 52.3676, lng: 4.9041 }, // Default to Amsterdam
    unitNumber: "",
    directions: "",
    transport: "",
    parking: "none"
  })
  
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    updateFormData("location", location)
  }, [location])
  
  // Handle clicks outside the suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Fetch address suggestions when the user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (addressQuery.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Focus on Netherlands for better results
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            addressQuery
          )}&format=json&addressdetails=1&countrycodes=nl&limit=5&featuretype=address`
        );
        
        if (response.ok) {
          const data: AddressSuggestion[] = await response.json();
          
          // Filter to only include actual addresses (with road information)
          const filteredData = data.filter(item => 
            item.address && item.address.road && 
            (item.class === "highway" || item.class === "building" || item.class === "place")
          );
          
          setSuggestions(filteredData);
          setShowSuggestions(filteredData.length > 0);
        }
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [addressQuery]);
  
  const updateLocation = (key: string, value: any) => {
    setLocation(prev => ({ ...prev, [key]: value }))
  }
  
  const handleCoordinatesUpdate = (lat: number, lng: number) => {
    updateLocation("coordinates", { lat, lng })
  }
  
  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    // Extract address components
    const { address, lat, lon, display_name } = suggestion;
    
    // Get the street address from the display name (first part before the comma)
    const streetAddress = address.road ? 
      `${address.road}${address.house_number ? ` ${address.house_number}` : ''}` : 
      display_name.split(",")[0].trim();
    
    // Update all location fields
    updateLocation("address", streetAddress);
    updateLocation("postalCode", address.postcode || "");
    
    // City could be in different fields depending on the location type
    const city = address.city || address.town || address.village || address.suburb || "";
    updateLocation("city", city);
    
    // Update country
    updateLocation("country", address.country || "Netherlands");
    
    // Update coordinates
    updateLocation("coordinates", { lat: parseFloat(lat), lng: parseFloat(lon) });
    
    // Save the selected address for display
    setSelectedAddress(suggestion);
    
    // Reset UI state
    setAddressQuery(streetAddress);
    setShowSuggestions(false);
  };
  
  // Format the full address for display
  const getFormattedAddress = () => {
    if (!selectedAddress) return null;
    
    const { address } = selectedAddress;
    const street = address.road ? `${address.road}${address.house_number ? ` ${address.house_number}` : ''}` : '';
    const city = address.city || address.town || address.village || address.suburb || "";
    const postcode = address.postcode || "";
    
    return (
      <div className="mt-2 p-3 bg-muted/50 rounded-md border border-muted">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">{street}</p>
            <p className="text-sm text-muted-foreground">
              {postcode} {city}, {address.country || "Netherlands"}
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Location Details</h2>
        <p className="text-muted-foreground">Tell us where your workspace is located</p>
      </div>
      
      <div className="grid gap-6">
        <div>
          <Label htmlFor="address" className="text-sm font-medium">Street Address</Label>
          <div className="relative">
            <Input 
              id="address"
              value={addressQuery || location.address || ""}
              onChange={(e) => {
                setAddressQuery(e.target.value);
                updateLocation("address", e.target.value);
                if (e.target.value === "") {
                  setSelectedAddress(null);
                }
              }}
              placeholder="Start typing to search for an address..."
              className="mt-1"
              autoComplete="off"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {/* Address suggestions dropdown */}
            {showSuggestions && (
              <div 
                ref={suggestionsRef}
                className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
              >
                <ul className="py-1">
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <li 
                        key={index}
                        className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                        onClick={() => handleAddressSelect(suggestion)}
                      >
                        {suggestion.display_name}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-sm text-muted-foreground">No addresses found</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          {/* Display selected address information */}
          {selectedAddress && getFormattedAddress()}
        </div>
        
        <div>
          <Label htmlFor="unitNumber" className="text-sm font-medium">Unit/Suite/Floor (Optional)</Label>
          <Input 
            id="unitNumber"
            value={location.unitNumber || ""}
            onChange={(e) => updateLocation("unitNumber", e.target.value)}
            placeholder="e.g. Suite 101"
            className="mt-1"
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Map Location</Label>
            <div className="text-xs text-muted-foreground flex items-center">
              <MapPin className="h-3 w-3 mr-1" /> Drag the marker to set exact location
            </div>
          </div>
          <div className="h-[300px] rounded-md overflow-hidden border">
            {/* @ts-ignore - Ignore TypeScript errors for dynamic component */}
            <LocationMap 
              initialPosition={location.coordinates} 
              onPositionChange={handleCoordinatesUpdate} 
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="directions" className="text-sm font-medium">Access Instructions (Optional)</Label>
          <Textarea 
            id="directions"
            value={location.directions || ""}
            onChange={(e) => updateLocation("directions", e.target.value)}
            placeholder="Provide any specific directions to find the workspace..."
            className="mt-1 h-20"
          />
        </div>
        
        <div>
          <Label htmlFor="transport" className="text-sm font-medium">Public Transport Options (Optional)</Label>
          <Textarea 
            id="transport"
            value={location.transport || ""}
            onChange={(e) => updateLocation("transport", e.target.value)}
            placeholder="Describe nearby public transport options..."
            className="mt-1 h-20"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-2 block">Parking Options</Label>
          <RadioGroup 
            value={location.parking || "none"} 
            onValueChange={(value) => updateLocation("parking", value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free" id="free_parking" />
              <Label htmlFor="free_parking">Free on-site parking</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paid" id="paid_parking" />
              <Label htmlFor="paid_parking">Paid on-site parking</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="street" id="street_parking" />
              <Label htmlFor="street_parking">Street parking available</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="no_parking" />
              <Label htmlFor="no_parking">No parking available</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}
