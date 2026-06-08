import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser, apiErrorResponse } from "@/lib/session"
import { parseJsonArray } from "@/types"
import { subMonths, startOfMonth, format } from "date-fns"

export const dynamic = "force-dynamic"

// Bookings that count as realized revenue for the host.
const REVENUE_STATUSES = ["CONFIRMED", "COMPLETED"] as const

/**
 * GET /api/dashboard
 *
 * Returns the signed-in user's real dashboard data: their listings (Spaces)
 * with per-listing booking counts and revenue, recent bookings on those
 * spaces, aggregate stats, and a 6-month revenue/bookings series for the
 * financial charts. Replaces the previous localStorage / mock data sources.
 */
export async function GET() {
  try {
    const user = await requireUser()

    // The user's listings, with their bookings so we can compute counts/revenue.
    const spaces = await db.space.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        bookings: {
          select: {
            id: true,
            status: true,
            totalPrice: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            space: { select: { title: true } },
          },
        },
      },
    })

    const isRevenueStatus = (status: string) =>
      (REVENUE_STATUSES as readonly string[]).includes(status)

    const listings = spaces.map((space) => {
      const photos = parseJsonArray(space.photos)
      const revenue = space.bookings
        .filter((b) => isRevenueStatus(b.status))
        .reduce((sum, b) => sum + b.totalPrice, 0)

      return {
        id: space.id,
        title: space.title,
        city: space.city,
        address: space.address,
        workspaceType: space.workspaceType,
        pricePerDay: space.pricePerDay,
        photo: photos[0] ?? null,
        createdAt: space.createdAt,
        bookingCount: space.bookings.length,
        revenue,
      }
    })

    // Flatten all bookings across the user's spaces for the recent list and
    // for the monthly series.
    const allBookings = spaces.flatMap((space) =>
      space.bookings.map((b) => ({
        id: b.id,
        spaceId: space.id,
        spaceTitle: space.title,
        address: space.address,
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.status,
        totalPrice: b.totalPrice,
        createdAt: b.createdAt,
      })),
    )

    const recentBookings = [...allBookings]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)

    const revenueBookings = allBookings.filter((b) => isRevenueStatus(b.status))

    const totalRevenue = revenueBookings.reduce(
      (sum, b) => sum + b.totalPrice,
      0,
    )

    const stats = {
      totalListings: listings.length,
      totalBookings: allBookings.length,
      totalRevenue,
      // Host keeps 80% after platform fee (matches the previous financial UI).
      availableForPayout: totalRevenue * 0.8,
    }

    // Build a 6-month series (oldest → newest), grouping realized bookings by
    // the month their stay started.
    const now = new Date()
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const monthDate = startOfMonth(subMonths(now, 5 - i))
      const key = format(monthDate, "yyyy-MM")
      const inMonth = revenueBookings.filter(
        (b) => format(startOfMonth(b.startDate), "yyyy-MM") === key,
      )
      return {
        month: format(monthDate, "MMM yyyy"),
        revenue: inMonth.reduce((sum, b) => sum + b.totalPrice, 0),
        bookings: inMonth.length,
      }
    })

    return NextResponse.json({
      listings,
      bookings: recentBookings,
      stats,
      monthlyRevenue,
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
