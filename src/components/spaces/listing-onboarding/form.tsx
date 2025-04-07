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
      // In a real app, this would be an API call to save the data
      // For now, we'll simulate a successful submission and save to localStorage
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Save the workspace listing to localStorage (simulating a database)
      const existingListings = JSON.parse(localStorage.getItem("workspaceListings") || "[]");
      const newListing = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString(),
        status: "active"
      };
      
      localStorage.setItem("workspaceListings", JSON.stringify([...existingListings, newListing]));
      
      // Clear form data from localStorage
      localStorage.removeItem("workspaceListingFormData")
      
      // Show success message
      toast({
        title: "Listing created successfully!",
        description: "Your workspace has been listed and is now visible to potential renters.",
      })
      
      // Redirect to success page or dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error submitting form", error)
      toast({
        title: "Submission failed",
        description: "There was an error creating your listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <WorkspaceTypeStep 
            formData={formData} 
            updateFormData={updateFormData} 
          />
        )
      case 2:
        return (
          <WorkspaceDetailsStep 
            formData={formData} 
            updateFormData={updateFormData} 
          />
        )
      case 3:
        return (
          <AmenitiesStep 
            formData={formData} 
            updateFormData={updateFormData} 
          />
        )
      case 4:
        return (
          <LocationStep 
            formData={formData} 
            updateFormData={updateFormData} 
          />
        )
      case 5:
        return (
          <WorkspacePhotosStep 
            formData={formData} 
            updateFormData={updateFormData} 
          />
        )
      case 6:
        return (
          <AvailabilityPricingStep 
            formData={formData} 
            updateFormData={updateFormData} 
          />
        )
      case 7:
        return (
          <FinalReviewStep 
            formData={formData} 
          />
        )
      default:
        return null
    }
  }
  
  // Check if the current step is valid to proceed
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.workspaceType
      case 2:
        return !!formData.workspaceDetails && Object.keys(formData.workspaceDetails).length > 0
      case 3:
        return !!formData.amenities && formData.amenities.length > 0
      case 4:
        return !!formData.location && !!formData.location.address
      case 5:
        return !!formData.photos && formData.photos.length > 0 && !!formData.title
      case 6:
        return !!formData.pricing && !!formData.pricing.pricePerDay && !!formData.hostInfo && !!formData.hostInfo.name
      case 7:
        return true // Final review step can always proceed to submission
      default:
        return false
    }
  }
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-4xl px-4 py-8">
        {/* Wrap the search params component in Suspense */}
        <Suspense fallback={null}>
          <FormWithSearchParams onStepChange={handleStepChange} />
        </Suspense>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Create Your Listing</h1>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep} of 7</span>
              <span>{getStepLabel(currentStep)}</span>
            </div>
            <Progress value={currentStep * 14.29} className="h-2" />
          </div>
        </div>
        
        <div className="bg-background rounded-lg border p-6 shadow-sm mb-6">
          {renderStepContent()}
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? "Back to Intro" : "Previous Step"}
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
              disabled={isLoading || !canProceed()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {currentStep === 7 ? "Submit Listing" : "Next Step"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getStepLabel(step: number): string {
  switch (step) {
    case 1: return "Workspace Type"
    case 2: return "Workspace Details"
    case 3: return "Amenities"
    case 4: return "Location"
    case 5: return "Photos & Description"
    case 6: return "Availability & Pricing"
    case 7: return "Final Review"
    default: return ""
  }
}
