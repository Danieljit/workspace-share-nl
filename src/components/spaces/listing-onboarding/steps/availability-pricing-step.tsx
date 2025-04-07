"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Euro } from "lucide-react"

type AvailabilityPricingStepProps = {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

type DayAvailability = {
  enabled: boolean;
  openTime: string;
  closeTime: string;
}

type WeekAvailability = {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

type HostInfo = {
  name: string;
  email: string;
  phone: string;
  preferredContact: string;
  responseTime: string;
  additionalInfo: string;
}

const DEFAULT_OPEN_TIME = "09:00";
const DEFAULT_CLOSE_TIME = "17:00";

const DEFAULT_AVAILABILITY: WeekAvailability = {
  monday: { enabled: true, openTime: DEFAULT_OPEN_TIME, closeTime: DEFAULT_CLOSE_TIME },
  tuesday: { enabled: true, openTime: DEFAULT_OPEN_TIME, closeTime: DEFAULT_CLOSE_TIME },
  wednesday: { enabled: true, openTime: DEFAULT_OPEN_TIME, closeTime: DEFAULT_CLOSE_TIME },
  thursday: { enabled: true, openTime: DEFAULT_OPEN_TIME, closeTime: DEFAULT_CLOSE_TIME },
  friday: { enabled: true, openTime: DEFAULT_OPEN_TIME, closeTime: DEFAULT_CLOSE_TIME },
  saturday: { enabled: false, openTime: DEFAULT_OPEN_TIME, closeTime: DEFAULT_CLOSE_TIME },
  sunday: { enabled: false, openTime: DEFAULT_OPEN_TIME, closeTime: DEFAULT_CLOSE_TIME },
};

const DEFAULT_PRICING = {
  pricePerDay: 25,
  pricePerThreeDays: 60,
  pricePerWeek: 120,
  pricePerMonth: 400,
};

const DEFAULT_HOST_INFO: HostInfo = {
  name: "",
  email: "",
  phone: "",
  preferredContact: "email",
  responseTime: "within 24 hours",
  additionalInfo: "",
};

export function AvailabilityPricingStep({ formData, updateFormData }: AvailabilityPricingStepProps) {
  // Initialize with default values and merge with any existing data
  const [availability, setAvailability] = useState<WeekAvailability>(() => {
    // Check if formData.availability exists and has the expected structure
    if (formData.availability && typeof formData.availability === 'object') {
      // Create a new object with defaults for any missing properties
      return {
        monday: {
          enabled: formData.availability.monday?.enabled ?? DEFAULT_AVAILABILITY.monday.enabled,
          openTime: formData.availability.monday?.openTime ?? DEFAULT_AVAILABILITY.monday.openTime,
          closeTime: formData.availability.monday?.closeTime ?? DEFAULT_AVAILABILITY.monday.closeTime,
        },
        tuesday: {
          enabled: formData.availability.tuesday?.enabled ?? DEFAULT_AVAILABILITY.tuesday.enabled,
          openTime: formData.availability.tuesday?.openTime ?? DEFAULT_AVAILABILITY.tuesday.openTime,
          closeTime: formData.availability.tuesday?.closeTime ?? DEFAULT_AVAILABILITY.tuesday.closeTime,
        },
        wednesday: {
          enabled: formData.availability.wednesday?.enabled ?? DEFAULT_AVAILABILITY.wednesday.enabled,
          openTime: formData.availability.wednesday?.openTime ?? DEFAULT_AVAILABILITY.wednesday.openTime,
          closeTime: formData.availability.wednesday?.closeTime ?? DEFAULT_AVAILABILITY.wednesday.closeTime,
        },
        thursday: {
          enabled: formData.availability.thursday?.enabled ?? DEFAULT_AVAILABILITY.thursday.enabled,
          openTime: formData.availability.thursday?.openTime ?? DEFAULT_AVAILABILITY.thursday.openTime,
          closeTime: formData.availability.thursday?.closeTime ?? DEFAULT_AVAILABILITY.thursday.closeTime,
        },
        friday: {
          enabled: formData.availability.friday?.enabled ?? DEFAULT_AVAILABILITY.friday.enabled,
          openTime: formData.availability.friday?.openTime ?? DEFAULT_AVAILABILITY.friday.openTime,
          closeTime: formData.availability.friday?.closeTime ?? DEFAULT_AVAILABILITY.friday.closeTime,
        },
        saturday: {
          enabled: formData.availability.saturday?.enabled ?? DEFAULT_AVAILABILITY.saturday.enabled,
          openTime: formData.availability.saturday?.openTime ?? DEFAULT_AVAILABILITY.saturday.openTime,
          closeTime: formData.availability.saturday?.closeTime ?? DEFAULT_AVAILABILITY.saturday.closeTime,
        },
        sunday: {
          enabled: formData.availability.sunday?.enabled ?? DEFAULT_AVAILABILITY.sunday.enabled,
          openTime: formData.availability.sunday?.openTime ?? DEFAULT_AVAILABILITY.sunday.openTime,
          closeTime: formData.availability.sunday?.closeTime ?? DEFAULT_AVAILABILITY.sunday.closeTime,
        },
      };
    }
    // If formData.availability doesn't exist or isn't properly structured, use defaults
    return { ...DEFAULT_AVAILABILITY };
  });
  
  const [pricing, setPricing] = useState(() => {
    return {
      pricePerDay: formData.pricing?.pricePerDay ?? DEFAULT_PRICING.pricePerDay,
      pricePerThreeDays: formData.pricing?.pricePerThreeDays ?? DEFAULT_PRICING.pricePerThreeDays,
      pricePerWeek: formData.pricing?.pricePerWeek ?? DEFAULT_PRICING.pricePerWeek,
      pricePerMonth: formData.pricing?.pricePerMonth ?? DEFAULT_PRICING.pricePerMonth,
    };
  });
  
  const [hostInfo, setHostInfo] = useState<HostInfo>(() => {
    return {
      name: formData.hostInfo?.name ?? DEFAULT_HOST_INFO.name,
      email: formData.hostInfo?.email ?? DEFAULT_HOST_INFO.email,
      phone: formData.hostInfo?.phone ?? DEFAULT_HOST_INFO.phone,
      preferredContact: formData.hostInfo?.preferredContact ?? DEFAULT_HOST_INFO.preferredContact,
      responseTime: formData.hostInfo?.responseTime ?? DEFAULT_HOST_INFO.responseTime,
      additionalInfo: formData.hostInfo?.additionalInfo ?? DEFAULT_HOST_INFO.additionalInfo,
    };
  });
  
  // Update form data when availability changes
  useEffect(() => {
    updateFormData("availability", availability);
  }, [availability]);
  
  // Update form data when pricing changes
  useEffect(() => {
    updateFormData("pricing", pricing);
  }, [pricing]);
  
  // Update form data when host info changes
  useEffect(() => {
    updateFormData("hostInfo", hostInfo);
  }, [hostInfo]);
  
  const updateAvailability = (day: keyof WeekAvailability, field: keyof DayAvailability, value: any) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };
  
  const updatePricing = (field: string, value: number) => {
    setPricing(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const updateHostInfo = (field: keyof HostInfo, value: string) => {
    setHostInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ] as const;
  
  const applyToAllDays = (openTime: string, closeTime: string) => {
    const updatedAvailability = { ...availability };
    
    days.forEach(({ key }) => {
      if (updatedAvailability[key].enabled) {
        updatedAvailability[key].openTime = openTime;
        updatedAvailability[key].closeTime = closeTime;
      }
    });
    
    setAvailability(updatedAvailability);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Availability & Pricing</h2>
        <p className="text-muted-foreground">Set when your workspace is available and how much it costs</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Weekly Availability</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground">
              <div>Day</div>
              <div>Open Time</div>
              <div>Close Time</div>
            </div>
            
            {days.map(({ key, label }) => (
              <div key={key} className="grid grid-cols-3 gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${key}-available`}
                    checked={availability[key].enabled}
                    onCheckedChange={(checked) => updateAvailability(key, 'enabled', !!checked)}
                  />
                  <Label htmlFor={`${key}-available`} className="cursor-pointer">{label}</Label>
                </div>
                
                <div>
                  <Input 
                    type="time"
                    value={availability[key].openTime}
                    onChange={(e) => updateAvailability(key, 'openTime', e.target.value)}
                    disabled={!availability[key].enabled}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Input 
                    type="time"
                    value={availability[key].closeTime}
                    onChange={(e) => updateAvailability(key, 'closeTime', e.target.value)}
                    disabled={!availability[key].enabled}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
            
            <div className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => applyToAllDays(DEFAULT_OPEN_TIME, DEFAULT_CLOSE_TIME)}
              >
                <Clock className="mr-2 h-4 w-4" />
                Apply 9AM-5PM to all enabled days
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="pricePerDay" className="text-sm font-medium">Price per day (€)</Label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                  id="pricePerDay"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.pricePerDay}
                  onChange={(e) => updatePricing('pricePerDay', parseFloat(e.target.value) || 0)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="pricePerThreeDays" className="text-sm font-medium">Price per 3 days (€)</Label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                  id="pricePerThreeDays"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.pricePerThreeDays}
                  onChange={(e) => updatePricing('pricePerThreeDays', parseFloat(e.target.value) || 0)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="pricePerWeek" className="text-sm font-medium">Price per week (€)</Label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                  id="pricePerWeek"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.pricePerWeek}
                  onChange={(e) => updatePricing('pricePerWeek', parseFloat(e.target.value) || 0)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="pricePerMonth" className="text-sm font-medium">Price per month (€)</Label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                  id="pricePerMonth"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.pricePerMonth}
                  onChange={(e) => updatePricing('pricePerMonth', parseFloat(e.target.value) || 0)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Host Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hostName" className="text-sm font-medium">Host Name</Label>
                <Input 
                  id="hostName"
                  value={hostInfo.name}
                  onChange={(e) => updateHostInfo('name', e.target.value)}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="hostEmail" className="text-sm font-medium">Email Address</Label>
                <Input 
                  id="hostEmail"
                  type="email"
                  value={hostInfo.email}
                  onChange={(e) => updateHostInfo('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="hostPhone" className="text-sm font-medium">Phone Number</Label>
              <Input 
                id="hostPhone"
                value={hostInfo.phone}
                onChange={(e) => updateHostInfo('phone', e.target.value)}
                placeholder="+31 6 12345678"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Preferred Contact Method</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="contact-email" 
                    name="preferred-contact"
                    value="email"
                    checked={hostInfo.preferredContact === 'email'}
                    onChange={() => updateHostInfo('preferredContact', 'email')}
                    className="h-4 w-4 text-primary"
                  />
                  <Label htmlFor="contact-email">Email</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="contact-phone" 
                    name="preferred-contact"
                    value="phone"
                    checked={hostInfo.preferredContact === 'phone'}
                    onChange={() => updateHostInfo('preferredContact', 'phone')}
                    className="h-4 w-4 text-primary"
                  />
                  <Label htmlFor="contact-phone">Phone</Label>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Typical Response Time</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="response-few-hours" 
                    name="response-time"
                    value="within a few hours"
                    checked={hostInfo.responseTime === 'within a few hours'}
                    onChange={() => updateHostInfo('responseTime', 'within a few hours')}
                    className="h-4 w-4 text-primary"
                  />
                  <Label htmlFor="response-few-hours">Within a few hours</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="response-24-hours" 
                    name="response-time"
                    value="within 24 hours"
                    checked={hostInfo.responseTime === 'within 24 hours'}
                    onChange={() => updateHostInfo('responseTime', 'within 24 hours')}
                    className="h-4 w-4 text-primary"
                  />
                  <Label htmlFor="response-24-hours">Within 24 hours</Label>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="hostAdditionalInfo" className="text-sm font-medium">Additional Host Information (Optional)</Label>
              <Textarea 
                id="hostAdditionalInfo"
                value={hostInfo.additionalInfo}
                onChange={(e) => updateHostInfo('additionalInfo', e.target.value)}
                placeholder="Any additional information you want to share with guests..."
                className="mt-1 h-20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
