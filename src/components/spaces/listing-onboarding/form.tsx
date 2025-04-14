"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { WorkspaceTypeStep } from "./steps/workspace-type-step"
import { WorkspaceDetailsStep } from "./steps/workspace-details-step"
import { AmenitiesStep } from "./steps/amenities-step"
import { LocationStep } from "./steps/location-step"
import { WorkspacePhotosStep } from "./steps/workspace-photos-step"
import { AvailabilityPricingStep } from "./steps/availability-pricing-step"
import { FinalReviewStep } from "./steps/final-review-step"
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/providers/auth-provider"

type FormData = {
  workspaceType: string | null;
  workspaceDetails: Record<string, any>;
  amenities: string[];
  location: Record<string, any>;
  buildingContext: Record<string, any>;
  photos: Array<string>;
  title: string;
  description: string;
  availability: Record<string, any>;
  pricing: Record<string, any>;
  hostInfo: Record<string, any>;
}

// Wrapper component that uses useSearchParams
function FormWithSearchParams({ onStepChange }: { onStepChange: (step: number) => void }) {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const step = parseInt(searchParams.get("step") || "1")
    if (!isNaN(step) && step >= 1 && step <= 7) {
      onStepChange(step)
    }
  }, [searchParams, onStepChange])
  
  return null
}

export function ListingForm() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
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
  
  // Update step based on URL parameter using the wrapper component
  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }
  
  // Auto-save form data to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("workspaceListingFormData")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData(prev => ({ ...prev, ...parsedData }))
      } catch (e) {
        console.error("Error parsing saved form data", e)
      }
    }
  }, [])
  
  useEffect(() => {
    localStorage.setItem("workspaceListingFormData", JSON.stringify(formData))
  }, [formData])
  
  // Generic update function that accepts any field name
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const nextStep = () => {
    if (currentStep < 7) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      router.push(`/test/list/form?step=${newStep}`)
    } else {
      // If we're on the last step, submit the form
      handleSubmit()
    }
  }
  
  const prevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      router.push(`/test/list/form?step=${newStep}`)
    } else {
      router.push("/test/list")
    }
  }
  
  const saveProgress = () => {
    // Already auto-saved, but could show confirmation
    toast({
      title: "Progress saved",
      description: "Your listing information has been saved. You can continue later.",
    })
  }
  
  const handleSubmit = async () => {
    // Validate form data
    if (!formData.workspaceType) {
      toast({
        title: "Missing information",
        description: "Please select a workspace type.",
        variant: "destructive",
      })
      router.push("/test/list/form?step=1")
      return
    }
    
    if (!formData.workspaceDetails || Object.keys(formData.workspaceDetails).length === 0) {
      toast({
        title: "Missing information",
        description: "Please complete the workspace details.",
        variant: "destructive",
      })
      router.push("/test/list/form?step=2")
      return
    }
    
    if (!formData.amenities || formData.amenities.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one amenity for your workspace.",
        variant: "destructive",
      })
      router.push("/test/list/form?step=3")
      return
    }
    
    if (!formData.location || !formData.location.address) {
      toast({
        title: "Missing information",
        description: "Please provide the workspace location.",
        variant: "destructive",
      })
      router.push("/test/list/form?step=4")
      return
    }
    
    if (!formData.photos || formData.photos.length === 0 || !formData.title) {
      toast({
        title: "Missing information",
        description: "Please add at least one photo and a title for your workspace.",
        variant: "destructive",
      })
      router.push("/test/list/form?step=5")
      return
    }
    
    if (!formData.pricing || !formData.pricing.pricePerDay || !formData.hostInfo || !formData.hostInfo.name) {
      toast({
        title: "Missing information",
        description: "Please complete the availability, pricing, and host information.",
        variant: "destructive",
      })
      router.push("/test/list/form?step=6")
      return
    }
    
    setIsLoading(true)
    
    try {
      // Prepare data for API submission
      const apiData = {
        title: formData.title,
        description: formData.description,
        workspaceType: formData.workspaceType,
        address: formData.location?.address,
        city: formData.location?.city,
        postalCode: formData.location?.postalCode,
        coordinates: formData.location?.coordinates,
        directions: formData.location?.directions,
        transportInfo: formData.location?.transportInfo,
        parkingInfo: formData.location?.parkingInfo,
        buildingContext: formData.buildingContext,
        workspaceDetails: formData.workspaceDetails,
        amenities: formData.amenities,
        photos: formData.photos,
        availability: formData.availability,
        pricing: formData.pricing,
        hostInfo: formData.hostInfo || {
          name: user?.name || "Demo Host",
          email: user?.email || "demo@example.com",
        },
        // Add user ID if authenticated
        userId: user?.id || "demo-user",
      }
      
      // Submit to API
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create listing')
      }
      
      const result = await response.json()
      
      // Clear form data from localStorage after successful submission
      localStorage.removeItem("workspaceListingFormData")
      
      // Show success message
      toast({
        title: "Listing created!",
        description: "Your workspace has been successfully listed.",
      })
      
      // Redirect to the new listing
      router.push(`/spaces/${result.id}`)
    } catch (error: any) {
      console.error('Error creating listing:', error)
      
      toast({
        title: "Error creating listing",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Calculate progress percentage
  const progressPercentage = (currentStep / 7) * 100
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WorkspaceTypeStep formData={formData} updateFormData={updateFormData} />
      case 2:
        return <WorkspaceDetailsStep formData={formData} updateFormData={updateFormData} />
      case 3:
        return <AmenitiesStep formData={formData} updateFormData={updateFormData} />
      case 4:
        return <LocationStep formData={formData} updateFormData={updateFormData} />
      case 5:
        return <WorkspacePhotosStep formData={formData} updateFormData={updateFormData} />
      case 6:
        return <AvailabilityPricingStep formData={formData} updateFormData={updateFormData} />
      case 7:
        return <FinalReviewStep formData={formData} />
      default:
        return <WorkspaceTypeStep formData={formData} updateFormData={updateFormData} />
    }
  }
  
  // Get the label for the current step
  const getStepLabel = (step: number) => {
    switch (step) {
      case 1: return "Workspace Type"
      case 2: return "Workspace Details"
      case 3: return "Amenities"
      case 4: return "Location"
      case 5: return "Photos & Description"
      case 6: return "Availability & Pricing"
      case 7: return "Review & Submit"
      default: return ""
    }
  }
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-4xl px-4 py-8">
        <Suspense fallback={null}>
          <FormWithSearchParams onStepChange={handleStepChange} />
        </Suspense>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">List Your Workspace</h1>
          <p className="text-muted-foreground mb-6">Step {currentStep} of 7: {getStepLabel(currentStep)}</p>
          
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          {renderStep()}
        </div>
        
        <div className="mt-8 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveProgress}
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Progress
            </Button>
            
            <Button
              onClick={nextStep}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {currentStep === 7 ? "Submit Listing" : "Next"}
                  {currentStep < 7 && <ArrowRight className="ml-2 h-4 w-4" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
