"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { WorkspaceTypeStep } from "@/components/spaces/listing-onboarding/steps/workspace-type-step"
import { WorkspaceDetailsStep } from "@/components/spaces/listing-onboarding/steps/workspace-details-step"
import { AmenitiesStep } from "@/components/spaces/listing-onboarding/steps/amenities-step"
import { LocationStep } from "@/components/spaces/listing-onboarding/steps/location-step"
import { WorkspacePhotosStep } from "@/components/spaces/listing-onboarding/steps/workspace-photos-step"
import { AvailabilityPricingStep } from "@/components/spaces/listing-onboarding/steps/availability-pricing-step"
import { FinalReviewStep } from "@/components/spaces/listing-onboarding/steps/final-review-step"
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type FormData = {
  workspaceType: string | null;
  workspaceDetails: Record<string, any>;
  amenities: string[];
  location: Record<string, any>;
  buildingContext: Record<string, any>;
  photos: Array<any>;
  title: string;
  description: string;
  availability: Record<string, any>;
  pricing: Record<string, any>;
  hostInfo: Record<string, any>;
  id?: string;
}

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [activeTab, setActiveTab] = useState("workspace-type")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    workspaceType: null,
    workspaceDetails: {},
    amenities: [],
    location: {},
    buildingContext: {},
    photos: [],
    title: "",
    description: "",
    availability: {},
    pricing: {},
    hostInfo: {}
  })

  // Fetch listing data when component mounts
  useEffect(() => {
    if (!params.id) return
    
    const fetchListing = async () => {
      setIsFetching(true)
      try {
        // First try to fetch from API
        try {
          const response = await fetch(`/api/spaces/${params.id}`)
          if (response.ok) {
            const apiData = await response.json()
            // Process API data and set form data
            processAndSetFormData(apiData)
            setIsFetching(false)
            return
          }
        } catch (apiError) {
          console.error("Error fetching from API, falling back to localStorage:", apiError)
        }
        
        // Fallback to localStorage if API fails
        const storedListings = localStorage.getItem("workspaceListings")
        if (storedListings) {
          const listings = JSON.parse(storedListings)
          const listing = listings.find((item: any) => item.id === params.id)
          
          if (listing) {
            processAndSetFormData(listing)
          } else {
            toast({
              title: "Listing not found",
              description: "The listing you're trying to edit could not be found.",
              variant: "destructive"
            })
            router.push("/dashboard")
          }
        }
      } catch (error) {
        console.error("Error fetching listing:", error)
        toast({
          title: "Error",
          description: "Failed to load listing data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsFetching(false)
      }
    }
    
    // Helper function to process and set form data
    const processAndSetFormData = (data: any) => {
      // Process the data to ensure it's in the correct format for the form
      // Parse JSON strings if needed
      console.log("Raw listing data:", data);
      
      // Process amenities - ensure it's an array of strings
      let amenities = [];
      if (data.amenities) {
        if (typeof data.amenities === 'string') {
          try {
            // Try to parse JSON string
            const parsedAmenities = JSON.parse(data.amenities);
            amenities = Array.isArray(parsedAmenities) ? parsedAmenities : [];
          } catch (e) {
            // If parsing fails, split by comma or use as single item
            amenities = data.amenities.includes(',') ? 
              data.amenities.split(',').map((a: string) => a.trim()) : 
              [data.amenities];
          }
        } else if (Array.isArray(data.amenities)) {
          // Already an array
          amenities = data.amenities;
        }
      }
      
      // Process location data - handle different formats
      let locationData = {};
      
      // If data has a location object, use that
      if (data.location && typeof data.location === 'object') {
        locationData = data.location;
      } 
      // If data has a location string that might be JSON, try to parse it
      else if (data.location && typeof data.location === 'string') {
        try {
          locationData = JSON.parse(data.location);
        } catch (e) {
          // If parsing fails, use the string as the address
          locationData = { address: data.location };
        }
      }
      // If data has address directly, create a location object
      else if (data.address) {
        locationData = {
          address: data.address,
          city: data.city || "",
          postalCode: data.postalCode || "",
          coordinates: parseJsonField(data.coordinates) || { lat: 52.3676, lng: 4.9041 },
          directions: data.directions || "",
          transportInfo: data.transportInfo || "",
          parkingInfo: data.parkingInfo || "none",
        };
      }
      
      console.log("Processed location data:", locationData);
      console.log("Processed amenities:", amenities);
      
      const processedData: FormData = {
        id: data.id,
        workspaceType: data.workspaceType || data.type || null,
        workspaceDetails: parseJsonField(data.workspaceDetails) || {},
        amenities: amenities,
        location: locationData,
        buildingContext: parseJsonField(data.buildingContext) || {},
        photos: parseJsonField(data.photos) || [],
        title: data.title || data.name || "",
        description: data.description || "",
        availability: parseJsonField(data.availability) || {},
        pricing: {
          pricePerDay: data.pricePerDay || (data.pricing?.pricePerDay) || 0,
          pricePerThreeDays: data.pricePerThreeDays || (data.pricing?.pricePerThreeDays) || 0,
          pricePerWeek: data.pricePerWeek || (data.pricing?.pricePerWeek) || 0,
          pricePerMonth: data.pricePerMonth || (data.pricing?.pricePerMonth) || 0,
        },
        hostInfo: parseJsonField(data.hostInfo) || {
          name: data.hostName || user?.name || "",
          email: data.hostEmail || user?.email || "",
          phone: data.hostPhone || "",
          preferredContact: data.preferredContact || "email",
          responseTime: data.responseTime || "within 24 hours",
          additionalInfo: "",
        },
      }
      
      setFormData(processedData)
      console.log("Loaded form data:", processedData)
    }
    
    // Helper function to parse JSON fields
    const parseJsonField = (field: any) => {
      if (!field) return null
      
      if (typeof field === 'string') {
        try {
          return JSON.parse(field)
        } catch (e) {
          return field
        }
      }
      
      return field
    }
    
    fetchListing()
  }, [params.id, router, user])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to edit your listing",
        variant: "destructive"
      })
      router.push("/signin")
    }
  }, [isAuthenticated, authLoading, router])

  // Generic update function that accepts any field name
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    console.log(`Updated ${field}:`, value);
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    // Map tab values to step numbers
    const tabToStep: Record<string, number> = {
      "workspace-type": 1,
      "workspace-details": 2,
      "amenities": 3,
      "location": 4,
      "photos": 5,
      "availability-pricing": 6,
      "review": 7
    }
    
    setCurrentStep(tabToStep[value] || 1)
  }

  const saveChanges = async () => {
    setIsLoading(true)
    
    try {
      // Validate form data
      if (!formData.workspaceType) {
        toast({
          title: "Missing information",
          description: "Please select a workspace type.",
          variant: "destructive",
        })
        handleTabChange("workspace-type")
        return
      }
      
      if (!formData.workspaceDetails || Object.keys(formData.workspaceDetails).length === 0) {
        toast({
          title: "Missing information",
          description: "Please complete the workspace details.",
          variant: "destructive",
        })
        handleTabChange("workspace-details")
        return
      }
      
      if (!formData.amenities || formData.amenities.length === 0) {
        toast({
          title: "Missing information",
          description: "Please select at least one amenity for your workspace.",
          variant: "destructive",
        })
        handleTabChange("amenities")
        return
      }
      
      if (!formData.location || !formData.location.address) {
        toast({
          title: "Missing information",
          description: "Please provide the workspace location.",
          variant: "destructive",
        })
        handleTabChange("location")
        return
      }
      
      if (!formData.photos || formData.photos.length === 0 || !formData.title) {
        toast({
          title: "Missing information",
          description: "Please add at least one photo and a title for your workspace.",
          variant: "destructive",
        })
        handleTabChange("photos")
        return
      }
      
      if (!formData.pricing || !formData.pricing.pricePerDay || !formData.hostInfo || !formData.hostInfo.name) {
        toast({
          title: "Missing information",
          description: "Please complete the availability, pricing, and host information.",
          variant: "destructive",
        })
        handleTabChange("availability-pricing")
        return
      }
      
      // Try to update via API first
      try {
        const response = await fetch(`/api/spaces/${params.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        
        if (response.ok) {
          // API update successful
          toast({
            title: "Changes saved",
            description: "Your listing has been updated successfully.",
          })
          router.push("/dashboard")
          return
        }
      } catch (apiError) {
        console.error("API update failed, falling back to localStorage:", apiError)
      }
      
      // Fallback to localStorage if API fails
      const storedListings = localStorage.getItem("workspaceListings")
      if (storedListings) {
        const listings = JSON.parse(storedListings)
        const updatedListings = listings.map((item: any) => {
          if (item.id === params.id) {
            return {
              ...item,
              ...formData,
              updatedAt: new Date().toISOString()
            }
          }
          return item
        })
        
        localStorage.setItem("workspaceListings", JSON.stringify(updatedListings))
      }
      
      // Show success message
      toast({
        title: "Changes saved",
        description: "Your listing has been updated successfully.",
      })
      
      // Redirect back to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating listing:", error)
      
      toast({
        title: "Error updating listing",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isFetching) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading listing data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Your Listing</h1>
        <p className="text-muted-foreground">Make changes to your workspace listing</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Listing: {formData.title}</CardTitle>
          <CardDescription>
            Update any information about your workspace listing using the tabs below
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 w-full">
              <TabsTrigger value="workspace-type">Type</TabsTrigger>
              <TabsTrigger value="workspace-details">Details</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="availability-pricing">Pricing</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>
            
            <div className="mt-6 p-4 border rounded-md">
              <TabsContent value="workspace-type">
                <WorkspaceTypeStep formData={formData} updateFormData={updateFormData} />
              </TabsContent>
              
              <TabsContent value="workspace-details">
                <WorkspaceDetailsStep formData={formData} updateFormData={updateFormData} />
              </TabsContent>
              
              <TabsContent value="amenities">
                <AmenitiesStep formData={formData} updateFormData={updateFormData} />
              </TabsContent>
              
              <TabsContent value="location">
                <LocationStep formData={formData} updateFormData={updateFormData} />
              </TabsContent>
              
              <TabsContent value="photos">
                <WorkspacePhotosStep formData={formData} updateFormData={updateFormData} />
              </TabsContent>
              
              <TabsContent value="availability-pricing">
                <AvailabilityPricingStep formData={formData} updateFormData={updateFormData} />
              </TabsContent>
              
              <TabsContent value="review">
                <FinalReviewStep formData={formData} />
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="mt-8 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <Button
              onClick={saveChanges}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
