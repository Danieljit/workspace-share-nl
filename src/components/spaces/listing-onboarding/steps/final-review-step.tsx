"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronDown, ChevronUp, Clock, Euro, MapPin, Calendar, Phone, Mail } from "lucide-react"

type FinalReviewStepProps = {
  formData: any;
}

export function FinalReviewStep({ formData }: FinalReviewStepProps) {
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    location: true,
    photos: true,
    availability: true,
    pricing: true,
    host: true,
  });
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const formatTime = (time: string) => {
    if (!time) return "";
    try {
      const [hours, minutes] = time.split(":")
      return `${hours}:${minutes}`
    } catch (e) {
      return time;
    }
  };
  
  const renderDayAvailability = (day: string, data: any) => {
    if (!data || !data.enabled) return null;
    
    return (
      <div className="flex justify-between py-1 text-sm">
        <span className="font-medium">{day}</span>
        <span>{formatTime(data.openTime)} - {formatTime(data.closeTime)}</span>
      </div>
    );
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Review Your Listing</h2>
        <p className="text-muted-foreground">Review all the information before submitting your workspace listing</p>
      </div>
      
      <div className="space-y-6">
        {/* Preview Header */}
        <div className="bg-muted/30 p-6 rounded-lg border">
          <div className="flex flex-col md:flex-row gap-6">
            {formData.photos && formData.photos.length > 0 && (
              <div className="md:w-1/3">
                <div className="aspect-video rounded-md overflow-hidden bg-muted">
                  <img 
                    src={formData.photos[0].preview} 
                    alt="Workspace preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className="md:w-2/3 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{formData.title || "Untitled Workspace"}</h1>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {formData.location?.address}, {formData.location?.city}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{formData.workspaceType}</Badge>
                {formData.workspaceDetails?.privacyType && (
                  <Badge variant="outline">{formData.workspaceDetails.privacyType}</Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Euro className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="font-semibold">{formData.pricing?.pricePerDay || 0}</span>
                  <span className="text-muted-foreground text-sm ml-1">/ day</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formData.availability?.monday?.enabled ? "Mon-" : ""}
                    {formData.availability?.friday?.enabled ? "Fri" : ""}
                    {formData.availability?.saturday?.enabled ? ", Sat" : ""}
                    {formData.availability?.sunday?.enabled ? ", Sun" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Workspace Details */}
        <Card>
          <CardContent className="p-0">
            <button 
              onClick={() => toggleSection("details")} 
              className="flex items-center justify-between w-full p-4 text-left font-medium"
            >
              <span>Workspace Details</span>
              {expandedSections.details ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {expandedSections.details && (
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <h3 className="font-medium">Type</h3>
                  <p>{formData.workspaceType}</p>
                </div>
                
                {formData.workspaceDetails && (
                  <>
                    <div>
                      <h3 className="font-medium">Privacy</h3>
                      <p>{formData.workspaceDetails.privacyType || "Not specified"}</p>
                    </div>
                    
                    {formData.workspaceDetails.deskCount && (
                      <div>
                        <h3 className="font-medium">Capacity</h3>
                        <p>{formData.workspaceDetails.deskCount} {formData.workspaceDetails.deskCount > 1 ? "desks" : "desk"}</p>
                      </div>
                    )}
                    
                    {formData.workspaceDetails.meetingRoomCapacity && (
                      <div>
                        <h3 className="font-medium">Meeting Room Capacity</h3>
                        <p>{formData.workspaceDetails.meetingRoomCapacity} people</p>
                      </div>
                    )}
                    
                    {formData.buildingContext && (
                      <div>
                        <h3 className="font-medium">Building Amenities</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {formData.buildingContext.wifi && <li>WiFi Available</li>}
                          {formData.buildingContext.printing && <li>Printing Facilities</li>}
                          {formData.buildingContext.kitchen && <li>Kitchen Access</li>}
                          {formData.buildingContext.coffee && <li>Coffee/Tea Provided</li>}
                          {formData.buildingContext.accessibility && <li>Wheelchair Accessible</li>}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Location */}
        <Card>
          <CardContent className="p-0">
            <button 
              onClick={() => toggleSection("location")} 
              className="flex items-center justify-between w-full p-4 text-left font-medium"
            >
              <span>Location</span>
              {expandedSections.location ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {expandedSections.location && formData.location && (
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p>{formData.location.address}</p>
                  {formData.location.unitNumber && <p>Unit: {formData.location.unitNumber}</p>}
                  <p>{formData.location.postalCode} {formData.location.city}, {formData.location.country}</p>
                </div>
                
                {formData.location.directions && (
                  <div>
                    <h3 className="font-medium">Access Instructions</h3>
                    <p>{formData.location.directions}</p>
                  </div>
                )}
                
                {formData.location.transport && (
                  <div>
                    <h3 className="font-medium">Public Transport</h3>
                    <p>{formData.location.transport}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium">Parking</h3>
                  <p>
                    {formData.location.parking === "free" && "Free on-site parking"}
                    {formData.location.parking === "paid" && "Paid on-site parking"}
                    {formData.location.parking === "street" && "Street parking available"}
                    {formData.location.parking === "none" && "No parking available"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Photos & Description */}
        <Card>
          <CardContent className="p-0">
            <button 
              onClick={() => toggleSection("photos")} 
              className="flex items-center justify-between w-full p-4 text-left font-medium"
            >
              <span>Photos & Description</span>
              {expandedSections.photos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {expandedSections.photos && (
              <div className="px-4 pb-4 space-y-4">
                {formData.photos && formData.photos.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Photos ({formData.photos.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {formData.photos.map((photo: any, index: number) => (
                        <div key={photo.id} className="aspect-square rounded-md overflow-hidden bg-muted">
                          <img 
                            src={photo.preview} 
                            alt={`Workspace photo ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.description && (
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <div className="prose prose-sm max-w-none mt-2" dangerouslySetInnerHTML={{ __html: formData.description }} />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Availability */}
        <Card>
          <CardContent className="p-0">
            <button 
              onClick={() => toggleSection("availability")} 
              className="flex items-center justify-between w-full p-4 text-left font-medium"
            >
              <span>Availability</span>
              {expandedSections.availability ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {expandedSections.availability && formData.availability && (
              <div className="px-4 pb-4">
                <div className="space-y-1">
                  {renderDayAvailability("Monday", formData.availability.monday)}
                  {renderDayAvailability("Tuesday", formData.availability.tuesday)}
                  {renderDayAvailability("Wednesday", formData.availability.wednesday)}
                  {renderDayAvailability("Thursday", formData.availability.thursday)}
                  {renderDayAvailability("Friday", formData.availability.friday)}
                  {renderDayAvailability("Saturday", formData.availability.saturday)}
                  {renderDayAvailability("Sunday", formData.availability.sunday)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Pricing */}
        <Card>
          <CardContent className="p-0">
            <button 
              onClick={() => toggleSection("pricing")} 
              className="flex items-center justify-between w-full p-4 text-left font-medium"
            >
              <span>Pricing</span>
              {expandedSections.pricing ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {expandedSections.pricing && formData.pricing && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Daily Rate</h3>
                    <p className="flex items-center">
                      <Euro className="h-4 w-4 mr-1" />
                      {formData.pricing.pricePerDay}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">3-Day Rate</h3>
                    <p className="flex items-center">
                      <Euro className="h-4 w-4 mr-1" />
                      {formData.pricing.pricePerThreeDays}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Weekly Rate</h3>
                    <p className="flex items-center">
                      <Euro className="h-4 w-4 mr-1" />
                      {formData.pricing.pricePerWeek}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Monthly Rate</h3>
                    <p className="flex items-center">
                      <Euro className="h-4 w-4 mr-1" />
                      {formData.pricing.pricePerMonth}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Host Information */}
        <Card>
          <CardContent className="p-0">
            <button 
              onClick={() => toggleSection("host")} 
              className="flex items-center justify-between w-full p-4 text-left font-medium"
            >
              <span>Host Information</span>
              {expandedSections.host ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {expandedSections.host && formData.hostInfo && (
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <h3 className="font-medium">Contact Information</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center">
                      <span className="font-medium w-32">Name:</span>
                      <span>{formData.hostInfo.name}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="font-medium w-32">Email:</span>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        <span>{formData.hostInfo.email}</span>
                        {formData.hostInfo.preferredContact === 'email' && (
                          <Badge variant="outline" className="ml-2">Preferred</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="font-medium w-32">Phone:</span>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        <span>{formData.hostInfo.phone}</span>
                        {formData.hostInfo.preferredContact === 'phone' && (
                          <Badge variant="outline" className="ml-2">Preferred</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="font-medium w-32">Response Time:</span>
                      <span>{formData.hostInfo.responseTime}</span>
                    </div>
                  </div>
                </div>
                
                {formData.hostInfo.additionalInfo && (
                  <div>
                    <h3 className="font-medium">Additional Information</h3>
                    <p className="mt-1">{formData.hostInfo.additionalInfo}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Submit Confirmation */}
        <div className="bg-muted/30 p-6 rounded-lg border mt-8">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Ready to Submit</h3>
              <p className="text-muted-foreground mt-1">
                Your workspace listing is ready to be submitted. Click the Submit button below to make your workspace available for booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
