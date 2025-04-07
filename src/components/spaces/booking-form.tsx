"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface BookingFormProps {
  price: number
}

export function BookingForm({ price }: BookingFormProps) {
  const threeDay = price * 3 * 0.9; // 10% discount for 3 days
  
  return (
    <Card className="p-6 sticky top-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Booking Info</h3>
          
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
          
          <Button className="w-full mb-6" size="lg">
            Book Now
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
