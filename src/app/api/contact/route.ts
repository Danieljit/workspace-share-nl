import { NextResponse } from "next/server"
import { z } from "zod"

// Define the contact form schema
const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(1),
  phone: z.string().optional(),
  subject: z.string().min(5),
  message: z.string().min(10),
})

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    
    // Validate the data against our schema
    const validatedData = contactFormSchema.parse(body)
    
    // In a real application, you would:
    // 1. Store the contact request in a database
    // 2. Send an email notification
    // 3. Possibly integrate with a CRM system
    
    // For now, we'll just log the data and return a success response
    console.log("Contact form submission:", validatedData)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return NextResponse.json(
      { success: true, message: "Contact form submitted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Contact form error:", error)
    
    // Check if it's a validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
}
