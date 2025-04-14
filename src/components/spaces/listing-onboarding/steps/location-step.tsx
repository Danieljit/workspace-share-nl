"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MapPin, CheckCircle2, Search, X } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"

// Dynamically import the map component to prevent SSR issues with Leaflet
const LocationMap = dynamic(
  () => import("../location-map"),
  { ssr: false }
)

type LocationStepProps = {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

// Interface for address suggestion
interface AddressSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

export function LocationStep({ formData, updateFormData }: LocationStepProps) {
  // Initialize location state with default values if not provided
  const defaultLocation = {
    address: "",
    coordinates: { lat: 52.3676, lng: 4.9041 }, // Default to Amsterdam
    unitNumber: "",
    directions: "",
    transportInfo: "",
    parkingInfo: "none",
    city: "",
    postalCode: "",
    country: "",
  };
  
  // Use a ref to track if the component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Initialize state with formData or defaults
  const [location, setLocation] = useState<Record<string, any>>(
    formData?.location || defaultLocation
  );
  
  // Track if we should update the parent form data
  const [shouldUpdateParent, setShouldUpdateParent] = useState(false);
  
  // State for address search
  const [addressInput, setAddressInput] = useState(location?.address || "");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Use useCallback to memoize the updateLocation function
  const updateLocation = useCallback((key: string, value: any) => {
    setLocation(prev => {
      const updated = { ...prev, [key]: value };
      return updated;
    });
    setShouldUpdateParent(true);
  }, []);
  
  // Update parent form data when location changes, but only if shouldUpdateParent is true
  useEffect(() => {
    if (shouldUpdateParent && isMounted.current) {
      updateFormData("location", location);
      setShouldUpdateParent(false);
    }
  }, [location, updateFormData, shouldUpdateParent]);
  
  // Set isMounted to false when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Handle coordinate updates from the map
  const handleCoordinatesUpdate = useCallback((lat: number, lng: number) => {
    updateLocation("coordinates", { lat, lng });
  }, [updateLocation]);
  
  // Handle address search
  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10&countrycodes=nl`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'WorkspaceShare/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Deduplicate addresses based on street, house number, and postal code
        const uniqueAddresses = new Map<string, AddressSuggestion>();
        
        data.forEach((suggestion: AddressSuggestion) => {
          const { address } = suggestion;
          const street = address.road || '';
          const houseNumber = address.house_number || '';
          const postcode = address.postcode || '';
          
          // Create a unique key for this address
          const addressKey = `${street}-${houseNumber}-${postcode}`.toLowerCase();
          
          // Only add if we don't already have this address or if it's a better match
          // (prefer addresses with more complete information)
          if (!uniqueAddresses.has(addressKey) || 
              (street && houseNumber && postcode && 
               (!uniqueAddresses.get(addressKey)?.address.road || 
                !uniqueAddresses.get(addressKey)?.address.house_number || 
                !uniqueAddresses.get(addressKey)?.address.postcode))) {
            uniqueAddresses.set(addressKey, suggestion);
          }
        });
        
        // Convert back to array and limit to 5 results
        const uniqueResults = Array.from(uniqueAddresses.values()).slice(0, 5);
        setAddressSuggestions(uniqueResults);
        setShowSuggestions(true);
      } else {
        console.error('Error searching for address:', response.statusText);
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching for address:', error);
      setAddressSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // Format address in Dutch style
  const formatDutchAddress = (suggestion: AddressSuggestion): string => {
    const { address } = suggestion;
    const street = address.road || '';
    const houseNumber = address.house_number || '';
    const postcode = address.postcode || '';
    const city = address.city || address.town || address.village || '';
    
    // Format as: Street Number, Postal City
    if (street && houseNumber && postcode && city) {
      return `${street} ${houseNumber}, ${postcode} ${city}`;
    } else if (street && houseNumber && city) {
      return `${street} ${houseNumber}, ${city}`;
    } else if (street && city) {
      return `${street}, ${city}`;
    } else {
      // Fallback to display name but try to clean it
      const cleanedName = suggestion.display_name.split(',').slice(0, 2).join(',');
      return cleanedName;
    }
  };
  
  // Debounce address search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchAddress(addressInput);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [addressInput, searchAddress]);
  
  // Handle click outside suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle address selection
  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    // Extract address components
    const { address } = suggestion;
    const street = address.road || '';
    const houseNumber = address.house_number || '';
    const streetAddress = street && houseNumber ? `${street} ${houseNumber}` : suggestion.display_name.split(',')[0].trim();
    const city = address.city || address.town || address.village || address.state || '';
    const postalCode = address.postcode || '';
    const country = address.country || '';
    
    // Update form fields
    setAddressInput(streetAddress);
    updateLocation("address", streetAddress);
    updateLocation("city", city);
    updateLocation("postalCode", postalCode);
    updateLocation("country", country);
    
    // Update map coordinates
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    updateLocation("coordinates", { lat, lng });
    
    // Hide suggestions
    setShowSuggestions(false);
  };
  
  // Clear address input
  const clearAddressInput = () => {
    setAddressInput("");
    setShowSuggestions(false);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Location Details</h2>
        <p className="text-muted-foreground">Tell us where your workspace is located</p>
      </div>
      
      <div className="grid gap-6">
        <div>
          <Label htmlFor="workspace-location" className="text-sm font-medium">Street Address</Label>
          <div className="relative">
            <div className="relative">
              <Input 
                id="workspace-location"
                name="workspace-location"
                data-1p-ignore="true"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Search for your workspace address"
                className="mb-1 pr-10"
                autoComplete="off"
                onFocus={() => addressInput.length >= 3 && setShowSuggestions(true)}
              />
              {addressInput ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full px-3 py-2" 
                  onClick={clearAddressInput}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
            </div>
            
            {/* Address suggestions dropdown */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
              >
                <ul className="py-1">
                  {addressSuggestions.map((suggestion) => (
                    <li 
                      key={suggestion.place_id} 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleAddressSelect(suggestion)}
                    >
                      {formatDutchAddress(suggestion)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Selected address details */}
          {(location.city || location.postalCode) && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{location.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {location.postalCode && location.city ? 
                      `${location.postalCode} ${location.city}` : 
                      [location.postalCode, location.city, location.country]
                        .filter(Boolean)
                        .join(", ")}
                  </p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="unitNumber" className="text-sm font-medium">Unit/Suite Number (Optional)</Label>
          <Input 
            id="unitNumber"
            data-1p-ignore="true"
            value={location?.unitNumber || ""}
            onChange={(e) => updateLocation("unitNumber", e.target.value)}
            placeholder="e.g. Suite 101, Floor 3"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium">Map Location</Label>
          <div className="h-64 rounded-md overflow-hidden border mt-1">
            <LocationMap 
              initialPosition={location?.coordinates} 
              onPositionChange={handleCoordinatesUpdate}
              multipleMarkers={[
                // Sample nearby locations to demonstrate clustering
                { lat: location?.coordinates?.lat + 0.001, lng: location?.coordinates?.lng + 0.001 },
                { lat: location?.coordinates?.lat - 0.001, lng: location?.coordinates?.lng - 0.001 },
                { lat: location?.coordinates?.lat + 0.002, lng: location?.coordinates?.lng + 0.002 },
                { lat: location?.coordinates?.lat - 0.002, lng: location?.coordinates?.lng - 0.003 },
                { lat: location?.coordinates?.lat + 0.005, lng: location?.coordinates?.lng + 0.001 },
              ]}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Drag the red stapler marker to adjust the exact location of your workspace</p>
        </div>
        
        <div>
          <Label htmlFor="directions" className="text-sm font-medium">Directions (Optional)</Label>
          <Textarea 
            id="directions"
            data-1p-ignore="true"
            value={location?.directions || ""}
            onChange={(e) => updateLocation("directions", e.target.value)}
            placeholder="Provide specific directions to help guests find your workspace"
            className="min-h-24"
          />
        </div>
        
        <div>
          <Label htmlFor="transportInfo" className="text-sm font-medium">Public Transport Information (Optional)</Label>
          <Textarea 
            id="transportInfo"
            data-1p-ignore="true"
            value={location?.transportInfo || ""}
            onChange={(e) => updateLocation("transportInfo", e.target.value)}
            placeholder="Describe nearby public transport options"
            className="min-h-24"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium">Parking Information</Label>
          <RadioGroup 
            value={location?.parkingInfo || "none"}
            onValueChange={(value) => updateLocation("parkingInfo", value)}
            className="mt-2 space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="parking-none" />
              <Label htmlFor="parking-none" className="font-normal">No parking available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free" id="parking-free" />
              <Label htmlFor="parking-free" className="font-normal">Free parking on premises</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paid" id="parking-paid" />
              <Label htmlFor="parking-paid" className="font-normal">Paid parking on premises</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="street" id="parking-street" />
              <Label htmlFor="parking-street" className="font-normal">Street parking available</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}
