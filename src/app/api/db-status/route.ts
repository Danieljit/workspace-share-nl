import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try to connect to the database and run a simple query
    const startTime = Date.now()
    
    // Check if we can connect to the database
    const userCount = await db.user.count()
    const spaceCount = await db.space.count()
    
    // Get database information
    const databaseInfo = await db.$queryRaw`SELECT current_database(), version()` as any[]
    
    // Calculate query execution time
    const executionTime = Date.now() - startTime
    
    return NextResponse.json({
      status: "connected",
      message: "Successfully connected to the database",
      stats: {
        userCount,
        spaceCount,
        executionTime: `${executionTime}ms`,
      },
      database: {
        name: databaseInfo[0]?.current_database || "unknown",
        version: databaseInfo[0]?.version || "unknown",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Database connection error:", error)
    
    return NextResponse.json({
      status: "error",
      message: "Failed to connect to the database",
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
