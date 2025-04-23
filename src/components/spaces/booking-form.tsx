"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { format, addDays, differenceInDays } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"

interface BookingFormProps {
  price: number
  spaceId?: string
}

export function BookingForm({ price, spaceId }: BookingFormProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [totalDays, setTotalDays] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { toast } = useToast()
  const router = useRouter()

  // Calculate discount for 3+ days
  const threeDay = price * 3 * 0.9 // 10% discount for 3 days
  
  // Function to fetch unavailable dates from the database
  const fetchUnavailableDates = async () => {
    if (!spaceId) return
    
    try {
      // Fetch unavailable dates from the API
      const response = await fetch(`/api/spaces/availability?spaceId=${spaceId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability data')
      }
      
      const data = await response.json()
      
      // Convert string dates to Date objects
      const unavailableDays = data.unavailableDates.map((dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number)
        return new Date(year, month - 1, day) // month is 0-indexed in JS Date
      })
      
      setUnavailableDates(unavailableDays)
    } catch (error) {
      console.error("Error fetching unavailable dates:", error)
      
      // Fallback to some sample unavailable dates for demonstration
      const today = new Date()
      const unavailableDays = [
        addDays(today, 2),
        addDays(today, 3),
        addDays(today, 10),
        addDays(today, 11),
        addDays(today, 12),
      ]
      
      setUnavailableDates(unavailableDays)
    }
  }
  
  // Fetch unavailable dates on component mount
  useEffect(() => {
    fetchUnavailableDates()
  }, [spaceId])
  
  // Calculate total days and price when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const days = differenceInDays(endDate, startDate) + 1
      setTotalDays(days)
      
      // Apply discount for 3+ days
      let calculatedPrice = price * days
      if (days >= 3) {
        calculatedPrice = calculatedPrice * 0.9 // 10% discount
      }
      
      setTotalPrice(calculatedPrice)
    } else {
      setTotalDays(0)
      setTotalPrice(0)
    }
  }, [startDate, endDate, price])
  
  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    
    // If no start date is selected or if the selected date is before the current start date
    // set it as the start date
    if (!startDate || (date < startDate)) {
      setStartDate(date)
      setEndDate(undefined)
      return
    }
    
    // If start date is already selected and the new date is after or equal to the start date
    // set it as the end date
    if (startDate && !endDate && date >= startDate) {
      // Check if there are any unavailable dates between start and selected end date
      const hasUnavailableDatesBetween = unavailableDates.some(unavailableDate => {
        return unavailableDate > startDate && unavailableDate <= date
      })
      
      if (hasUnavailableDatesBetween) {
        // If there are unavailable dates in between, just set the start date to the new date
        setStartDate(date)
        setEndDate(undefined)
      } else {
        setEndDate(date)
      }
      return
    }
    
    // If both dates are already selected, reset and start over with the new date
    setStartDate(date)
    setEndDate(undefined)
  }
  
  // Format the date range for display
  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`
    }
    if (startDate) {
      return format(startDate, "MMM d, yyyy")
    }
    return "Select dates"
  }
  
  // Disable dates that are unavailable or in the past
  const disabledDays = [
    ...unavailableDates,
    { before: new Date() } // Disable dates in the past
  ]
  
  // Handle booking submission
  const handleBooking = async () => {
    if (!startDate || !endDate || !spaceId) {
      toast({
        title: "Error",
        description: "Please select dates for your booking",
        variant: "destructive"
      })
      return
    }
    
    // Navigate to the booking confirmation page with query parameters
    router.push(`/spaces/${spaceId}/book?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&days=${totalDays}&price=${totalPrice.toFixed(2)}`);
  }
  
  return (
    <Card className="p-6 sticky top-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Booking Info</h3>
          
          {/* Date Picker */}
          <div className="mb-4">
            <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <DialogTrigger asChild>
                <div className="border rounded-md p-3 cursor-pointer hover:border-primary">
                  <p className="text-sm text-muted-foreground mb-1">Dates</p>
                  <p className="font-medium">{formatDateRange()}</p>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] p-0">
                <div className="p-6">
                  <DialogTitle className="text-xl font-semibold mb-4 text-center">Select Dates</DialogTitle>
                  <Calendar
                    mode="range"
                    defaultMonth={new Date()}
                    selected={{
                      from: startDate,
                      to: endDate
                    }}
                    onSelect={(range: DateRange | undefined) => {
                      if (range?.from) handleDateSelect(range.from)
                      if (range?.to) setEndDate(range.to)
                    }}
                    disabled={disabledDays}
                    numberOfMonths={2}
                    showOutsideDays={true}
                    className="mx-auto"
                  />
                  
                  <div className="mt-6 flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCalendarOpen(false)}>Cancel</Button>
                    <Button 
                      onClick={() => setIsCalendarOpen(false)}
                      disabled={!startDate || !endDate}
                    >
                      Confirm Dates
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border rounded-md p-4 text-center">
              <p className="text-sm text-muted-foreground">Price per day</p>
              <p className="text-2xl font-bold">${price}</p>
            </div>
            
            <div className="border rounded-md p-4 text-center">
              <p className="text-sm text-muted-foreground">Price per 3 days</p>
              <p className="text-2xl font-bold">${threeDay.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Save 10%</p>
            </div>
          </div>
          
          {/* Show total calculation when dates are selected */}
          {totalDays > 0 && (
            <div className="mb-6 border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>${price} × {totalDays} days</span>
                <span>${(price * totalDays).toFixed(2)}</span>
              </div>
              
              {totalDays >= 3 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>10% discount</span>
                  <span>-${(price * totalDays * 0.1).toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          <Button 
            className="w-full mb-6" 
            size="lg"
            disabled={!startDate || !endDate || isSubmitting}
            onClick={handleBooking}
          >
            {isSubmitting ? 'Submitting...' : 'Book Now'}
          </Button>
          
          <div>
            <h4 className="text-sm font-semibold mb-2">Availability</h4>
            <div className="text-sm">
              <p className="flex justify-between py-1 border-b">
                <span>Monday - Friday</span>
                <span>8:00 - 18:00</span>
              </p>
              <p className="flex justify-between py-1 border-b">
                <span>Saturday</span>
                <span>Closed</span>
              </p>
              <p className="flex justify-between py-1 border-b">
                <span>Sunday</span>
                <span>Closed</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
