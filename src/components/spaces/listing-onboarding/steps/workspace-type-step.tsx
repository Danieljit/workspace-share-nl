"use client"

import { useEffect, useState } from "react"
import { LampDesk, Building2, Users } from "lucide-react"

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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className={`border rounded-lg p-6 cursor-pointer transition-all hover:border-primary hover:shadow-md ${selectedType === "DESK" ? "border-primary bg-primary/5" : ""}`}
          onClick={() => setSelectedType("DESK")}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-full mb-4 ${selectedType === "DESK" ? "bg-primary text-white" : "bg-muted"}`}>
              <LampDesk className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">Desk</h3>
            <p className="text-sm text-muted-foreground">Individual workspace in a shared or private environment</p>
          </div>
        </div>
        
        <div 
          className={`border rounded-lg p-6 cursor-pointer transition-all hover:border-primary hover:shadow-md ${selectedType === "OFFICE" ? "border-primary bg-primary/5" : ""}`}
          onClick={() => setSelectedType("OFFICE")}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-full mb-4 ${selectedType === "OFFICE" ? "bg-primary text-white" : "bg-muted"}`}>
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">Office</h3>
            <p className="text-sm text-muted-foreground">Private or shared office space for teams</p>
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
      </div>
    </div>
  )
}
