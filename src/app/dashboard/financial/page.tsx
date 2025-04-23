"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  CreditCard, 
  Calendar, 
  DollarSign,
  BarChart3,
  PieChart,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/providers/auth-provider";
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";

// Mock data for financial charts
const generateMockRevenueData = (months = 6) => {
  const data = [];
  const currentDate = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(currentDate, i);
    const revenue = Math.floor(Math.random() * 500) + 100; // Random revenue between 100 and 600
    data.push({
      month: format(date, 'MMM yyyy'),
      revenue
    });
  }
  
  return data;
};

const generateMockBookingData = (months = 6) => {
  const data = [];
  const currentDate = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(currentDate, i);
    const bookings = Math.floor(Math.random() * 10) + 1; // Random bookings between 1 and 10
    data.push({
      month: format(date, 'MMM yyyy'),
      bookings
    });
  }
  
  return data;
};

const generateMockTransactions = (count = 10) => {
  const transactions = [];
  const currentDate = new Date();
  const transactionTypes = ['booking', 'payout', 'refund'];
  const spaceNames = [
    'Modern Office in City Center',
    'Cozy Desk Space in Creative Hub',
    'Meeting Room for Professional Events',
    'Amsterdam Canal View Office',
    'Rotterdam Modern Workspace'
  ];
  
  for (let i = 0; i < count; i++) {
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const date = new Date(currentDate);
    date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Random date within last 60 days
    
    let amount, status;
    
    if (type === 'booking') {
      amount = Math.floor(Math.random() * 100) + 20; // Random amount between 20 and 120
      status = Math.random() > 0.1 ? 'completed' : 'pending';
    } else if (type === 'payout') {
      amount = -(Math.floor(Math.random() * 200) + 50); // Random payout between 50 and 250
      status = Math.random() > 0.05 ? 'completed' : 'processing';
    } else {
      amount = -(Math.floor(Math.random() * 50) + 10); // Random refund between 10 and 60
      status = 'completed';
    }
    
    transactions.push({
      id: `txn-${i}`,
      date,
      type,
      description: type === 'booking' 
        ? `Booking: ${spaceNames[Math.floor(Math.random() * spaceNames.length)]}` 
        : type === 'payout' 
          ? 'Payout to bank account' 
          : 'Refund for cancelled booking',
      amount,
      status
    });
  }
  
  // Sort by date, newest first
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export default function FinancialPage() {
  const [timeRange, setTimeRange] = useState("6m");
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [bookingData, setBookingData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your financial information",
        variant: "destructive"
      });
      router.push("/signin");
      return;
    }

    // Load financial data
    const loadFinancialData = () => {
      try {
        // Generate mock data based on selected time range
        const months = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
        
        setRevenueData(generateMockRevenueData(months));
        setBookingData(generateMockBookingData(months));
        setTransactions(generateMockTransactions(15));
      } catch (error) {
        console.error("Error loading financial data:", error);
        toast({
          title: "Error",
          description: "Failed to load financial data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadFinancialData();
    }
  }, [isAuthenticated, isLoading, router, toast, timeRange]);

  // Calculate summary metrics
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = bookingData.reduce((sum, item) => sum + item.bookings, 0);
  const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  
  // Calculate month-over-month growth
  const currentMonthRevenue = revenueData.length > 0 ? revenueData[revenueData.length - 1].revenue : 0;
  const previousMonthRevenue = revenueData.length > 1 ? revenueData[revenueData.length - 2].revenue : 0;
  const revenueGrowth = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0;

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
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
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In the selected period
            </p>
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
            <p className="text-xs text-muted-foreground mt-1">
              Per booking
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available for Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(totalRevenue * 0.8).toFixed(2)}</div>
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
                Your earnings from {timeRange === "3m" ? "the last 3 months" : timeRange === "6m" ? "the last 6 months" : "the last 12 months"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* In a real app, this would be a chart component */}
              <div className="h-[300px] flex items-end justify-between gap-2">
                {revenueData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-primary w-full rounded-t-md" 
                      style={{ height: `${(item.revenue / Math.max(...revenueData.map(d => d.revenue))) * 200}px` }}
                    ></div>
                    <div className="text-xs mt-2 text-muted-foreground">{item.month}</div>
                    <div className="text-sm font-medium">€{item.revenue}</div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" className="ml-auto">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Bookings Over Time</CardTitle>
              <CardDescription>
                Number of bookings received
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* In a real app, this would be a chart component */}
              <div className="h-[300px] flex items-end justify-between gap-2">
                {bookingData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-blue-500 w-full rounded-t-md" 
                      style={{ height: `${(item.bookings / Math.max(...bookingData.map(d => d.bookings))) * 200}px` }}
                    ></div>
                    <div className="text-xs mt-2 text-muted-foreground">{item.month}</div>
                    <div className="text-sm font-medium">{item.bookings}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your recent financial transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${
                        transaction.type === 'booking' 
                          ? 'bg-green-100 text-green-700' 
                          : transaction.type === 'payout' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type === 'booking' ? (
                          <Calendar className="h-4 w-4" />
                        ) : transaction.type === 'payout' ? (
                          <CreditCard className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(transaction.date, 'MMM d, yyyy')} • 
                          <span className={`ml-1 ${
                            transaction.status === 'completed' 
                              ? 'text-green-600' 
                              : transaction.status === 'pending' 
                                ? 'text-yellow-600' 
                                : 'text-blue-600'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {transaction.amount >= 0 ? '+' : ''}€{transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" className="ml-auto">
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
