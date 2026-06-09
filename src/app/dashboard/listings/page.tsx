"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  Calendar,
  Edit,
  MoreHorizontal,
  ArrowUpDown,
  Search,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import Image from "next/image";
import { PlaceholderImage } from "@/components/ui/placeholder-image";

type DashboardListing = {
  id: string;
  title: string;
  city: string;
  address: string;
  workspaceType: string;
  pricePerDay: number;
  photo: string | null;
  createdAt: string;
  bookingCount: number;
  revenue: number;
};

type DashboardStats = {
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
  availableForPayout: number;
};

function placeholderType(workspaceType: string) {
  switch (workspaceType) {
    case "OFFICE":
      return "office" as const;
    case "DESK":
      return "desk" as const;
    case "MEETING_ROOM":
      return "meeting" as const;
    case "EVENT_SPACE":
      return "event" as const;
    default:
      return "generic" as const;
  }
}

export default function ListingsPage() {
  const [listings, setListings] = useState<DashboardListing[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your listings",
        variant: "destructive",
      });
      router.push("/signin");
      return;
    }

    if (!isAuthenticated) return;

    let cancelled = false;
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) {
          throw new Error("Failed to load listings");
        }
        const json = await res.json();
        if (!cancelled) {
          setListings(json.listings ?? []);
          setStats(json.stats ?? null);
        }
      } catch (err) {
        console.error("Error fetching listings:", err);
        if (!cancelled) {
          setError("Failed to load your listings. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchListings();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, router, toast]);

  // Filter and sort listings (operates on real data).
  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.address.toLowerCase().includes(query) ||
          listing.city.toLowerCase().includes(query) ||
          listing.workspaceType.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "price-high":
        result.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "price-low":
        result.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "most-booked":
        result.sort((a, b) => b.bookingCount - a.bookingCount);
        break;
      case "most-revenue":
        result.sort((a, b) => b.revenue - a.revenue);
        break;
    }

    return result;
  }, [listings, searchQuery, sortBy]);

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
          <h1 className="text-2xl font-bold tracking-tight">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your workspace listings and track their performance
          </p>
        </div>
        <Button asChild>
          <Link href="/test/list/form">
            <Plus className="mr-2 h-4 w-4" />
            Create New Listing
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalListings ?? listings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Across your account</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalBookings ?? listings.reduce((sum, l) => sum + l.bookingCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{(stats?.totalRevenue ?? listings.reduce((sum, l) => sum + l.revenue, 0)).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">From confirmed bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort by
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest first</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest first</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("price-high")}>
              Price (high to low)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("price-low")}>
              Price (low to high)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("most-booked")}>Most booked</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("most-revenue")}>
              Highest revenue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Listings table */}
      {filteredListings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No listings found</h3>
            <p className="text-muted-foreground mb-6 text-center">
              {searchQuery
                ? "No listings match your search criteria. Try a different search term."
                : "You haven't created any workspace listings yet."}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/test/list/form">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Listing
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden lg:table-cell">Bookings</TableHead>
                <TableHead className="hidden lg:table-cell">Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        {listing.photo ? (
                          <Image
                            src={listing.photo}
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <PlaceholderImage
                            type={placeholderType(listing.workspaceType)}
                            fill
                            alt={listing.title}
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{listing.title}</div>
                        <div className="text-sm text-muted-foreground hidden sm:block">
                          {listing.address}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{listing.workspaceType.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">€{listing.pricePerDay}/day</TableCell>
                  <TableCell className="hidden lg:table-cell">{listing.bookingCount}</TableCell>
                  <TableCell className="hidden lg:table-cell">€{listing.revenue.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/spaces/${listing.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Listing
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/edit/${listing.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Listing
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
