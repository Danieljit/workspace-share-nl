"use client"

import { useEffect, useState } from "react"
import { LampDesk, Building2, Users, Users2 } from "lucide-react"

type WorkspaceTypeStepProps = {
  formData: any;
  updateFormData: (...args: any[]) => void;
}

export function WorkspaceTypeStep({ formData, updateFormData }: WorkspaceTypeStepProps) {
  const [selectedType, setSelectedType] = useState<string | null>(formData.workspaceType)
  
  // Only run this effect when selectedType changes, not when updateFormData changes
  useEffect(() => {
    if (selectedType) {
      updateFormData("workspaceType", selectedType)
    }
  }, [selectedType]) // Remove updateFormData from dependencies
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Tell Us About Your Workplace</h2>
        <p className="text-muted-foreground">Select the type of workspace you're listing</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className={`border rounded-lg p-6 cursor-pointer transition-all hover:border-primary hover:shadow-md ${selectedType === "SINGLE_DESK" ? "border-primary bg-primary/5" : ""}`}
          onClick={() => setSelectedType("SINGLE_DESK")}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-full mb-4 ${selectedType === "SINGLE_DESK" ? "bg-primary text-white" : "bg-muted"}`}>
              <LampDesk className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">Single Desk</h3>
            <p className="text-sm text-muted-foreground">Individual workspace for focused work</p>
          </div>
        </div>
        
        <div 
          className={`border rounded-lg p-6 cursor-pointer transition-all hover:border-primary hover:shadow-md ${selectedType === "PRIVATE_OFFICE" ? "border-primary bg-primary/5" : ""}`}
          onClick={() => setSelectedType("PRIVATE_OFFICE")}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-full mb-4 ${selectedType === "PRIVATE_OFFICE" ? "bg-primary text-white" : "bg-muted"}`}>
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">Private Office</h3>
            <p className="text-sm text-muted-foreground">Dedicated office space for individuals or small teams</p>
          </div>
        </div>
        
        <div 
          className={`border rounded-lg p-6 cursor-pointer transition-all hover:border-primary hover:shadow-md ${selectedType === "MEETING_ROOM" ? "border-primary bg-primary/5" : ""}`}
          onClick={() => setSelectedType("MEETING_ROOM")}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-full mb-4 ${selectedType === "MEETING_ROOM" ? "bg-primary text-white" : "bg-muted"}`}>
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">Meeting Room</h3>
            <p className="text-sm text-muted-foreground">Conference or meeting space for collaborative work</p>
          </div>
        </div>
        
        <div 
          className={`border rounded-lg p-6 cursor-pointer transition-all hover:border-primary hover:shadow-md ${selectedType === "CO_WORKING" ? "border-primary bg-primary/5" : ""}`}
          onClick={() => setSelectedType("CO_WORKING")}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-full mb-4 ${selectedType === "CO_WORKING" ? "bg-primary text-white" : "bg-muted"}`}>
              <Users2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">Co-Working Space</h3>
            <p className="text-sm text-muted-foreground">Shared workspace in a collaborative environment</p>
          </div>
        </div>
      </div>
    </div>
  )
}
