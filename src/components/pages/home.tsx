"use client"

import { useState } from "react"
import { Space, User } from "@prisma/client"
import { SearchBar } from "@/components/search-bar"
import { QuickFilter } from "@/components/ui/quick-filter"
import { FeaturedSpaces } from "@/components/spaces/featured-spaces"
import { Footer } from "@/components/layout/footer"
import { HomeTestimonials } from "@/components/sections/home-testimonials"
import { testimonials } from "@/data/testimonials"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { WorkspaceTypeSelect } from "@/components/spaces/workspace-type-select"

interface HomePageProps {
  spaces: (Space & { owner: User })[]
}

export function HomePage({ spaces }: HomePageProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const router = useRouter()

  const handleFilterClick = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    )
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/spaces?search=${encodeURIComponent(query)}`)
    }
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[600px] bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="relative h-[600px] rounded-xl overflow-hidden shadow-2xl">
            {/* Background Image */}
            <img
              src="https://images.pexels.com/photos/7070/space-desk-workspace-coworking.jpg"
              alt="Modern Workspace"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay for text contrast */}
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Content Box - Positioned differently based on screen size */}
            <div className="absolute inset-0 flex items-center">
              {/* On smaller screens (below lg), this will be a full-width box at the bottom */}
              <div className="w-full lg:w-1/3 p-8 bg-white/90 backdrop-blur-sm lg:h-full flex flex-col justify-center space-y-8 absolute bottom-0 lg:relative lg:bottom-auto">
                <div className="space-y-4">
                  <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl text-gray-900">
                    It's work, but better
                  </h1>
                  <p className="text-lg text-gray-600">
                    Find the perfect workspace that fits your needs and style
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <SearchBar
                      onSearch={handleSearch}
                      placeholder="Enter location..."
                    />
                    
                    <WorkspaceTypeSelect 
                      onSelect={(type) => console.log(type)}
                    />
                    
                    <Button 
                      className="w-full py-6 text-lg rounded-xl" 
                      onClick={() => handleSearch('all')}
                    >
                      Find Workspaces
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="container mx-auto px-4 py-8">
        <QuickFilter
          onFilterChange={(filterId) => {
            handleFilterClick(filterId);
            // If it's a workspace type, we could also update the workspace type select
            // or navigate to filtered results
          }}
          className="mb-4"
        />
      </section>

      {/* Featured Spaces */}
      <section className="container mx-auto px-4">
        <FeaturedSpaces spaces={spaces} />
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2">What People Say</h2>
          <p className="text-muted-foreground mb-8">
            Hear from our satisfied workspace users
          </p>
          <HomeTestimonials testimonials={testimonials} />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-5xl">search</span>
            <h3 className="text-xl font-semibold">Easy Booking</h3>
            <p className="text-gray-600">
              Find and book your workspace in minutes, not hours.
            </p>
          </div>
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-5xl">verified</span>
            <h3 className="text-xl font-semibold">Verified Spaces</h3>
            <p className="text-gray-600">
              Every workspace is verified for quality and comfort.
            </p>
          </div>
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-5xl">schedule</span>
            <h3 className="text-xl font-semibold">Flexible Terms</h3>
            <p className="text-gray-600">
              Book for a day or longer, no long-term commitments.
            </p>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg" 
            alt="Collaborative workspace" 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-white">Our Mission</h2>
              <p className="text-lg mb-6 text-white/90">
                We're creating a world where work happens in the right space at the right time. By unlocking underutilized workspaces, we're building communities where professionals can find not just a desk, but inspiration, connection, and freedom.
              </p>
              <p className="text-lg mb-8 text-white/90">
                The future of work isn't returning to normal. It's creating something better.
              </p>
              <Link href="/about">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">Learn About Us</Button>
              </Link>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg border border-white/20 shadow-xl">
                <h3 className="text-2xl font-bold mb-4 text-white">Our Values</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="bg-white/20 p-1 rounded mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div>
                      <span className="font-semibold text-white">Freedom</span>
                      <p className="text-white/80 text-sm">Work should adapt to your life, not consume it.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-white/20 p-1 rounded mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div>
                      <span className="font-semibold text-white">Connection</span>
                      <p className="text-white/80 text-sm">The best ideas happen when diverse minds meet.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-white/20 p-1 rounded mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div>
                      <span className="font-semibold text-white">Trust</span>
                      <p className="text-white/80 text-sm">Our community thrives on reliability, safety, and respect.</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-6 text-right">
                  <Link href="/about" className="text-white/90 hover:text-white text-sm underline underline-offset-4">See all our values →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
