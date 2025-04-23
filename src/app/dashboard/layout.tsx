"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Calendar, 
  Home, 
  User, 
  CreditCard, 
  Settings,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const tabs = [
  {
    name: "Bookings",
    href: "/dashboard/bookings",
    icon: Calendar,
  },
  {
    name: "My Listings",
    href: "/dashboard/listings",
    icon: Home,
  },
  {
    name: "Financial",
    href: "/dashboard/financial",
    icon: CreditCard,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  
  // Prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="flex items-center">
            <BookOpen className="h-6 w-6 mr-2" />
            <span className="font-bold">WorkspaceShare</span>
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="font-medium">Dashboard</span>
        </div>
      </div>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] px-4 py-6">
        <aside className="hidden md:block">
          <nav className="grid items-start gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname?.startsWith(tab.href)
                    ? "bg-accent text-accent-foreground"
                    : "transparent"
                )}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                <span>{tab.name}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
