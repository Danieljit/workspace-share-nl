"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Building, Coffee, Calendar, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  type?: "office" | "desk" | "meeting" | "event" | "generic";
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  alt?: string;
}

export function PlaceholderImage({
  type = "generic",
  className,
  fill = false,
  width = 300,
  height = 200,
  alt = "Workspace image"
}: PlaceholderImageProps) {
  // Generate a random color for the placeholder
  const [bgColor, setBgColor] = useState("");
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Generate a random pastel color
    const hue = Math.floor(Math.random() * 360);
    const pastelColor = `hsl(${hue}, 70%, 80%)`;
    setBgColor(pastelColor);
    setMounted(true);
  }, []);
  
  // Select icon based on type
  const Icon = {
    office: Building,
    desk: Coffee,
    meeting: Users,
    event: Calendar,
    generic: Briefcase
  }[type];
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        fill ? "w-full h-full" : "",
        className
      )}
      style={{ 
        backgroundColor: bgColor,
        width: fill ? "100%" : width,
        height: fill ? "100%" : height
      }}
    >
      <Icon className="text-white opacity-50" style={{ width: "30%", height: "30%" }} />
    </div>
  );
}
