"use client"

import { useEffect, useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type WorkspaceDetailsStepProps = {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export function WorkspaceDetailsStep({ formData, updateFormData }: WorkspaceDetailsStepProps) {
  const [details, setDetails] = useState<Record<string, any>>(formData.workspaceDetails || {})
  const [buildingContext, setBuildingContext] = useState<Record<string, any>>(formData.buildingContext || {})
  
  useEffect(() => {
    updateFormData("workspaceDetails", details)
  }, [details])
  
  useEffect(() => {
    updateFormData("buildingContext", buildingContext)
  }, [buildingContext])
  
  const updateDetails = (key: string, value: any) => {
    setDetails(prev => ({ ...prev, [key]: value }))
  }
  
  const updateBuildingContext = (key: string, value: any) => {
    setBuildingContext(prev => ({ ...prev, [key]: value }))
  }
  
  const renderWorkspaceTypeDetails = () => {
    switch (formData.workspaceType) {
      case "DESK":
        return renderDeskDetails()
      case "OFFICE":
        return renderOfficeDetails()
      case "MEETING_ROOM":
        return renderMeetingRoomDetails()
      default:
        return null
    }
  }
  
  const renderDeskDetails = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Desk Privacy</h3>
          <RadioGroup 
            value={details.privacyType || ""} 
            onValueChange={(value) => updateDetails("privacyType", value)}
            className="space-y-3"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="private_room" id="private_room" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="private_room" className="font-medium">Private desk in dedicated room</Label>
                <p className="text-sm text-muted-foreground">A desk in a room where the booker will be alone</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="shared_small" id="shared_small" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="shared_small" className="font-medium">Desk in shared workspace (2-5 people)</Label>
                <p className="text-sm text-muted-foreground">A desk in a room shared with a few others</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="open_plan" id="open_plan" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="open_plan" className="font-medium">Desk in open-plan coworking space</Label>
                <p className="text-sm text-muted-foreground">A desk in a larger open workspace environment</p>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Desk Specifications</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="standard_desk" 
                checked={details.standard_desk || false}
                onCheckedChange={(checked) => updateDetails("standard_desk", checked)}
              />
              <Label htmlFor="standard_desk">Standard desk</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="standing_desk" 
                checked={details.standing_desk || false}
                onCheckedChange={(checked) => updateDetails("standing_desk", checked)}
              />
              <Label htmlFor="standing_desk">Standing desk</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="adjustable_desk" 
                checked={details.adjustable_desk || false}
                onCheckedChange={(checked) => updateDetails("adjustable_desk", checked)}
              />
              <Label htmlFor="adjustable_desk">Adjustable height desk</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="corner_desk" 
                checked={details.corner_desk || false}
                onCheckedChange={(checked) => updateDetails("corner_desk", checked)}
              />
              <Label htmlFor="corner_desk">Corner/L-shaped desk</Label>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const renderOfficeDetails = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Office Privacy</h3>
          <RadioGroup 
            value={details.privacyType || ""} 
            onValueChange={(value) => updateDetails("privacyType", value)}
            className="space-y-3"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="private_office" id="private_office" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="private_office" className="font-medium">Private office (door closes)</Label>
                <p className="text-sm text-muted-foreground">A fully enclosed office with a door</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="shared_office" id="shared_office" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="shared_office" className="font-medium">Shared office space</Label>
                <p className="text-sm text-muted-foreground">An office shared with others</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="partitioned" id="partitioned" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="partitioned" className="font-medium">Partitioned area</Label>
                <p className="text-sm text-muted-foreground">A semi-private area divided by partitions</p>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Office Capacity</h3>
          <div className="grid gap-2">
            <Label htmlFor="capacity">Number of workstations</Label>
            <Input 
              id="capacity" 
              type="number" 
              min="1" 
              max="50"
              value={details.capacity || ""}
              onChange={(e) => updateDetails("capacity", e.target.value)}
              placeholder="e.g., 4"
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Office Type</h3>
          <RadioGroup 
            value={details.officeType || ""} 
            onValueChange={(value) => updateDetails("officeType", value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="executive" id="executive" />
              <Label htmlFor="executive">Executive office</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="team" id="team" />
              <Label htmlFor="team">Team office</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="creative" id="creative" />
              <Label htmlFor="creative">Creative space</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="studio" id="studio" />
              <Label htmlFor="studio">Studio</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    )
  }
  
  const renderMeetingRoomDetails = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Room Capacity</h3>
          <Select 
            value={details.capacity || ""}
            onValueChange={(value) => updateDetails("capacity", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2-4">2-4 people</SelectItem>
              <SelectItem value="5-8">5-8 people</SelectItem>
              <SelectItem value="9-12">9-12 people</SelectItem>
              <SelectItem value="13-20">13-20 people</SelectItem>
              <SelectItem value="20+">20+ people</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Table Configuration</h3>
          <RadioGroup 
            value={details.tableConfig || ""} 
            onValueChange={(value) => updateDetails("tableConfig", value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="boardroom" id="boardroom" />
              <Label htmlFor="boardroom">Boardroom style</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="u_shape" id="u_shape" />
              <Label htmlFor="u_shape">U-shape setup</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="classroom" id="classroom" />
              <Label htmlFor="classroom">Classroom style</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="theater" id="theater" />
              <Label htmlFor="theater">Theater style</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no_table" id="no_table" />
              <Label htmlFor="no_table">No table (open space)</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">AV Capabilities</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="projector" 
                checked={details.projector || false}
                onCheckedChange={(checked) => updateDetails("projector", checked)}
              />
              <Label htmlFor="projector">Projector/Screen</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="video_conf" 
                checked={details.video_conf || false}
                onCheckedChange={(checked) => updateDetails("video_conf", checked)}
              />
              <Label htmlFor="video_conf">Video conferencing</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="whiteboard" 
                checked={details.whiteboard || false}
                onCheckedChange={(checked) => updateDetails("whiteboard", checked)}
              />
              <Label htmlFor="whiteboard">Whiteboard/Smartboard</Label>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Workspace Details</h2>
        <p className="text-muted-foreground">Tell us more about your {formData.workspaceType?.toLowerCase()?.replace("_", " ")}</p>
      </div>
      
      {renderWorkspaceTypeDetails()}
      
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Building Context</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Building Type</h3>
            <RadioGroup 
              value={buildingContext.buildingType || ""} 
              onValueChange={(value) => updateBuildingContext("buildingType", value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="office_building" id="office_building" />
                <Label htmlFor="office_building">Office building</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="coworking" id="coworking" />
                <Label htmlFor="coworking">Coworking center</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="commercial" id="commercial" />
                <Label htmlFor="commercial">Commercial space</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="home_office" id="home_office" />
                <Label htmlFor="home_office">Home office</Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="other" id="other" className="mt-1" />
                <div className="grid gap-1.5">
                  <Label htmlFor="other">Other</Label>
                  {buildingContext.buildingType === "other" && (
                    <Input 
                      value={buildingContext.otherBuildingType || ""}
                      onChange={(e) => updateBuildingContext("otherBuildingType", e.target.value)}
                      placeholder="Please specify"
                      className="max-w-sm"
                    />
                  )}
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Access Method</h3>
            <RadioGroup 
              value={buildingContext.accessMethod || ""} 
              onValueChange={(value) => updateBuildingContext("accessMethod", value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public">Public access (no security)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reception" id="reception" />
                <Label htmlFor="reception">Reception/front desk check-in</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="keycard" id="keycard" />
                <Label htmlFor="keycard">Keycard/code required</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="host" id="host" />
                <Label htmlFor="host">Host will provide access</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Floor Location</h3>
            <Select 
              value={buildingContext.floorLocation || ""}
              onValueChange={(value) => updateBuildingContext("floorLocation", value)}
            >
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Select floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basement">Basement</SelectItem>
                <SelectItem value="ground">Ground floor</SelectItem>
                {Array.from({ length: 40 }, (_, i) => i + 1).map((floor) => (
                  <SelectItem key={floor} value={floor.toString()}>
                    Floor {floor}
                  </SelectItem>
                ))}
                <SelectItem value="40+">Floor 40+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
