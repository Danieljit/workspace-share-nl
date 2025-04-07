"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

interface Testimonial {
  name: string
  role: string
  image: string
  rating: number
  content: string
}

interface HomeTestimonialsProps {
  testimonials: Testimonial[]
}

export function HomeTestimonials({ testimonials }: HomeTestimonialsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={testimonial.image} alt={testimonial.name} />
              <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{testimonial.name}</h4>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            </div>
          </div>
          <div className="mt-4 flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`material-icons text-lg ${
                  i < testimonial.rating ? "text-black" : "text-gray-300"
                }`}
              >
                {i < testimonial.rating ? "star" : "star_border"}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
            {testimonial.content}
          </p>
        </Card>
      ))}
    </div>
  )
}
