"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Settings, 
  Eye, 
  Calendar, 
  TrendingUp, 
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  Search
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your listings",
        variant: "destructive"
      });
      router.push("/signin");
      return;
    }

    // Fetch listings data
    const fetchListings = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data or localStorage
        const storedListings = localStorage.getItem("workspaceListings");
        let listingsData = [];
        
        if (storedListings) {
          listingsData = JSON.parse(storedListings);
        } else {
          // Mock data if no listings in localStorage
          listingsData = [
            {
              id: "listing1",
              title: "Modern Office in City Center",
              description: "A bright and modern office space in the heart of the city.",
              workspaceType: "OFFICE",
              address: "Marktstraat 15, Enschede",
              pricePerDay: 35,
              photos: [{ preview: "/images/spaces/office-1.jpg" }],
              createdAt: new Date(2025, 2, 15).toISOString(),
              status: "active",
              views: 124,
              bookings: 5,
              revenue: 175
            },
            {
              id: "listing2",
              title: "Cozy Desk Space in Creative Hub",
              description: "A comfortable desk in our creative community workspace.",
              workspaceType: "DESK",
              address: "Oude Markt 24, Enschede",
              pricePerDay: 20,
              photos: [{ preview: "/images/spaces/desk-1.jpg" }],
              createdAt: new Date(2025, 3, 5).toISOString(),
              status: "active",
              views: 87,
              bookings: 3,
              revenue: 60
            },
            {
              id: "listing3",
              title: "Meeting Room for Professional Events",
              description: "A professional meeting room perfect for client meetings and team events.",
              workspaceType: "MEETING_ROOM",
              address: "Hengelosestraat 500, Enschede",
              pricePerDay: 75,
              photos: [{ preview: "/images/spaces/meeting-1.jpg" }],
              createdAt: new Date(2025, 1, 20).toISOString(),
              status: "inactive",
              views: 45,
              bookings: 0,
              revenue: 0
            }
          ];
        }
        
        setListings(listingsData);
        setFilteredListings(listingsData);
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast({
          title: "Error",
          description: "Failed to load your listings. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchListings();
    }
  }, [isAuthenticated, isLoading, router, toast]);

  // Filter and sort listings
  useEffect(() => {
    let result = [...listings];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(listing => 
        listing.title.toLowerCase().includes(query) || 
        listing.address.toLowerCase().includes(query) ||
        listing.workspaceType.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
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
        result.sort((a, b) => b.bookings - a.bookings);
        break;
      case "most-revenue":
        result.sort((a, b) => b.revenue - a.revenue);
        break;
    }
    
    setFilteredListings(result);
  }, [listings, searchQuery, sortBy]);

  const handleDeleteListing = (id: string) => {
    // In a real app, this would call an API to delete the listing
    const updatedListings = listings.filter(listing => listing.id !== id);
    setListings(updatedListings);
    
    // Update localStorage
    localStorage.setItem("workspaceListings", JSON.stringify(updatedListings));
    
    toast({
      title: "Listing deleted",
      description: "Your listing has been successfully deleted.",
    });
  };

  const toggleListingStatus = (id: string) => {
    const updatedListings = listings.map(listing => {
      if (listing.id === id) {
        return {
          ...listing,
          status: listing.status === "active" ? "inactive" : "active"
        };
      }
      return listing;
    });
    
    setListings(updatedListings);
    
    // Update localStorage
    localStorage.setItem("workspaceListings", JSON.stringify(updatedListings));
    
    const listing = updatedListings.find(l => l.id === id);
    toast({
      title: `Listing ${listing.status === "active" ? "activated" : "deactivated"}`,
      description: `Your listing "${listing.title}" is now ${listing.status}.`,
    });
  };

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
            <div className="text-2xl font-bold">{listings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {listings.filter(l => l.status === "active").length} active
            </p>
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
              {listings.reduce((sum, listing) => sum + (listing.bookings || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all listings
            </p>
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
              €{listings.reduce((sum, listing) => sum + (listing.revenue || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From all bookings
            </p>
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
            <DropdownMenuItem onClick={() => setSortBy("newest")}>
              Newest first
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("oldest")}>
              Oldest first
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("price-high")}>
              Price (high to low)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("price-low")}>
              Price (low to high)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("most-booked")}>
              Most booked
            </DropdownMenuItem>
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
                <TableHead className="hidden lg:table-cell">Views</TableHead>
                <TableHead className="hidden lg:table-cell">Bookings</TableHead>
                <TableHead className="hidden lg:table-cell">Revenue</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        {listing.photos && listing.photos.length > 0 ? (
                          <Image 
                            src={listing.photos[0].preview} 
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <PlaceholderImage
                            type={listing.workspaceType === "OFFICE" ? "office" : 
                                  listing.workspaceType === "DESK" ? "desk" : 
                                  listing.workspaceType === "MEETING_ROOM" ? "meeting" : 
                                  listing.workspaceType === "EVENT_SPACE" ? "event" : "generic"}
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
                  <TableCell className="hidden md:table-cell">
                    €{listing.pricePerDay}/day
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {listing.views || 0}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {listing.bookings || 0}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    €{listing.revenue || 0}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                      {listing.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => toggleListingStatus(listing.id)}>
                          <Settings className="mr-2 h-4 w-4" />
                          {listing.status === "active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteListing(listing.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Listing
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
