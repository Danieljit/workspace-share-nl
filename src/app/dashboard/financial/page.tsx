"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/providers/auth-provider";
import { format } from "date-fns";

type MonthlyRevenue = {
  month: string;
  revenue: number;
  bookings: number;
};

type DashboardBooking = {
  id: string;
  spaceId: string;
  spaceTitle: string;
  address: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number;
  createdAt: string;
};

type DashboardStats = {
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
  availableForPayout: number;
};

type DashboardData = {
  monthlyRevenue: MonthlyRevenue[];
  bookings: DashboardBooking[];
  stats: DashboardStats;
};

export default function FinancialPage() {
  const [timeRange, setTimeRange] = useState("6m");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your financial information",
        variant: "destructive",
      });
      router.push("/signin");
      return;
    }

    if (!isAuthenticated) return;

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) {
          throw new Error("Failed to load financial data");
        }
        const json = (await res.json()) as DashboardData;
        if (!cancelled) setData(json);
      } catch (err) {
        console.error("Error loading financial data:", err);
        if (!cancelled) {
          setError("Failed to load financial data. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, router, toast]);

  // The API returns the last 6 months; the selector narrows to the most recent
  // 3 or 6 of those.
  const monthsToShow = timeRange === "3m" ? 3 : 6;
  const monthlyRevenue = (data?.monthlyRevenue ?? []).slice(-monthsToShow);

  // Realized bookings, newest first, used as the transaction list.
  const transactions = [...(data?.bookings ?? [])]
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Summary metrics derived from the (windowed) monthly series.
  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = monthlyRevenue.reduce((sum, item) => sum + item.bookings, 0);
  const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  const availableForPayout = totalRevenue * 0.8;

  const currentMonthRevenue =
    monthlyRevenue.length > 0 ? monthlyRevenue[monthlyRevenue.length - 1].revenue : 0;
  const previousMonthRevenue =
    monthlyRevenue.length > 1 ? monthlyRevenue[monthlyRevenue.length - 2].revenue : 0;
  const revenueGrowth =
    previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

  const hasRevenueData = monthlyRevenue.some((m) => m.revenue > 0 || m.bookings > 0);
  const maxRevenue = Math.max(1, ...monthlyRevenue.map((d) => d.revenue));
  const maxBookings = Math.max(1, ...monthlyRevenue.map((d) => d.bookings));

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" />
          <h3 className="text-xl font-medium mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-muted-foreground">
            Track your earnings, bookings, and financial metrics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
            <div className="flex items-center mt-1">
              {revenueGrowth >= 0 ? (
                <div className="flex items-center text-green-500 text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {Math.abs(revenueGrowth).toFixed(1)}% from last month
                </div>
              ) : (
                <div className="flex items-center text-red-500 text-xs">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  {Math.abs(revenueGrowth).toFixed(1)}% from last month
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">In the selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Booking Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{averageBookingValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per booking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available for Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{availableForPayout.toFixed(2)}</div>
            <div className="flex items-center mt-1">
              <Button variant="link" className="h-auto p-0 text-xs">
                Request Payout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and data */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>
                Your earnings from {timeRange === "3m" ? "the last 3 months" : "the last 6 months"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasRevenueData ? (
                <div className="h-[300px] flex items-end justify-between gap-2">
                  {monthlyRevenue.map((item) => (
                    <div key={item.month} className="flex flex-col items-center flex-1">
                      <div
                        className="bg-primary w-full rounded-t-md"
                        style={{ height: `${(item.revenue / maxRevenue) * 200}px` }}
                      ></div>
                      <div className="text-xs mt-2 text-muted-foreground">{item.month}</div>
                      <div className="text-sm font-medium">€{item.revenue.toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">
                    No revenue yet. Once your listings receive confirmed bookings, your earnings
                    will appear here.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" className="ml-auto" disabled={!hasRevenueData}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bookings Over Time</CardTitle>
              <CardDescription>Number of confirmed bookings received</CardDescription>
            </CardHeader>
            <CardContent>
              {hasRevenueData ? (
                <div className="h-[300px] flex items-end justify-between gap-2">
                  {monthlyRevenue.map((item) => (
                    <div key={item.month} className="flex flex-col items-center flex-1">
                      <div
                        className="bg-blue-500 w-full rounded-t-md"
                        style={{ height: `${(item.bookings / maxBookings) * 200}px` }}
                      ></div>
                      <div className="text-xs mt-2 text-muted-foreground">{item.month}</div>
                      <div className="text-sm font-medium">{item.bookings}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">No bookings in the selected period.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent booking earnings</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">
                    No transactions yet. Confirmed bookings on your listings will show up here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-full p-2 bg-green-100 text-green-700">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Booking: {transaction.spaceTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.createdAt), "MMM d, yyyy")} •
                            <span className="ml-1 text-green-600">
                              {transaction.status.charAt(0) +
                                transaction.status.slice(1).toLowerCase()}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="font-medium text-green-600">
                        +€{transaction.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" className="ml-auto" disabled={transactions.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export Transactions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
