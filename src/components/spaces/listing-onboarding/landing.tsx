"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Info, Camera, CheckCircle } from "lucide-react"

export function ListingOnboardingLanding() {
  const router = useRouter()
  const [animatedValue, setAnimatedValue] = useState(0)
  const [days, setDays] = useState(0)
  const [isSliding, setIsSliding] = useState(false)
  const [initialAnimationComplete, setInitialAnimationComplete] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Initial animation for the counter and slider
  useEffect(() => {
    if (!initialAnimationComplete) {
      // Animate the counter from 0 to 250
      const counterInterval = setInterval(() => {
        setAnimatedValue(prev => {
          // Gradually move towards 250
          if (prev < 250) {
            return Math.min(prev + 5, 250);
          }
          clearInterval(counterInterval);
          return 250;
        });
      }, 30);

      // Animate days from 0 to 15
      const daysInterval = setInterval(() => {
        setDays(prev => {
          if (prev < 15) {
            return prev + 1;
          }
          clearInterval(daysInterval);
          return 15;
        });
      }, 100);

      // Animate slider to halfway position
      const timer = setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.width = '50%';
          setAnimatedValue(250); // Set to exactly 250 when slider reaches midpoint
          setDays(15); // Set to exactly 15 days
          setInitialAnimationComplete(true);
        }
      }, 1500);

      return () => {
        clearInterval(counterInterval);
        clearInterval(daysInterval);
        clearTimeout(timer);
      };
    }
  }, [initialAnimationComplete]);

  const handleSliderChange = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return
    
    const rect = sliderRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const position = clientX - rect.left
    const percentage = Math.min(Math.max(position / rect.width, 0), 1)
    
    // Update slider position
    if (progressRef.current) {
      progressRef.current.style.width = `${percentage * 100}%`
    }
    
    // Calculate and update the values
    // Days: 0-30 days of a month
    const newDays = Math.round(percentage * 30)
    setDays(newDays)
    
    // Earnings: based on days (€16.67 per day to reach €500 for 30 days)
    const newValue = Math.round(newDays * 16.67)
    setAnimatedValue(newValue)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsSliding(true)
    handleSliderChange(e)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsSliding(true)
    handleSliderChange(e)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSliding) {
      handleSliderChange(e)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSliding) {
      handleSliderChange(e)
    }
  }

  const handleMouseUp = () => {
    setIsSliding(false)
  }

  const handleTouchEnd = () => {
    setIsSliding(false)
  }

  // Add event listeners for mouse/touch events outside the slider
  useEffect(() => {
    if (isSliding) {
      document.addEventListener('mousemove', handleMouseMove as any)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove as any, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove as any)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isSliding])

  const handleGetStarted = () => {
    router.push("/test/list/form")
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-6xl px-4 py-12">
        {/* Title in its own row */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Turn Your Empty Space Into Income
          </h1>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
              <h2 className="text-xl font-medium mb-2">Earn up to</h2>
              <div className="text-4xl font-bold text-primary mb-4">
                €{animatedValue.toLocaleString()} <span className="text-xl font-normal">per month</span>
              </div>
              
              {/* Interactive slider with days indicator */}
              <div className="mt-4 space-y-2">
                <div 
                  ref={sliderRef}
                  className="h-6 bg-primary/20 rounded-full cursor-pointer relative"
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  <div 
                    ref={progressRef}
                    className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300 ease-out"
                    style={{ width: '0%' }}
                  ></div>
                  <div 
                    className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/4 bg-white border-2 border-primary rounded-full h-8 w-8 shadow-md"
                    style={{ left: progressRef.current ? progressRef.current.style.width : '0%' }}
                  ></div>
                </div>
                
                {/* Minimalistic days indicator */}
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>0</span>
                  <div className="flex-1 mx-2 text-center text-sm font-medium">
                    {days} {days === 1 ? 'day' : 'days'}
                  </div>
                  <span>30</span>
                </div>
              </div>
              
              <p className="text-muted-foreground mt-4">with your unused workspace</p>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">No long-term commitments</p>
                  <p className="text-muted-foreground">List your space only when it works for you</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">You control availability</p>
                  <p className="text-muted-foreground">Set your own schedule and booking rules</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Offset your office costs</p>
                  <p className="text-muted-foreground">Turn unused space into a revenue stream</p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            <div className="grid gap-4">
              <div className="bg-background rounded-lg border p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Info className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">1. Tell us about your workplace</h3>
                    <p className="text-muted-foreground">Share details about your space and location</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-background rounded-lg border p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">2. Show us your space</h3>
                    <p className="text-muted-foreground">Upload photos and describe your workspace</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-background rounded-lg border p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">3. Finalize your listing</h3>
                    <p className="text-muted-foreground">Set pricing, availability, and booking rules</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full text-lg py-6"
              onClick={handleGetStarted}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
