import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SeverityType } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSeverity(severity: string): string {
  switch (severity) {
    case SeverityType.HIGH:
      return "High";
    case SeverityType.MEDIUM:
      return "Medium";
    case SeverityType.LOW:
      return "Low";
    default:
      return severity;
  }
}

export function getSeverityColor(severity: string): {
  border: string;
  bg: string;
  text: string;
  dot: string;
  dialogHeader: string;
} {
  switch (severity) {
    case SeverityType.HIGH:
      return {
        border: "border-red-500",
        bg: "bg-red-50",
        text: "text-red-600",
        dot: "bg-red-500",
        dialogHeader: "bg-red-500"
      };
    case SeverityType.MEDIUM:
      return {
        border: "border-amber-500",
        bg: "bg-amber-50",
        text: "text-amber-600",
        dot: "bg-amber-500",
        dialogHeader: "bg-amber-500"
      };
    case SeverityType.LOW:
      return {
        border: "border-blue-500",
        bg: "bg-blue-50",
        text: "text-blue-600",
        dot: "bg-blue-500",
        dialogHeader: "bg-blue-500"
      };
    default:
      return {
        border: "border-gray-500",
        bg: "bg-gray-50",
        text: "text-gray-600",
        dot: "bg-gray-500",
        dialogHeader: "bg-gray-800"
      };
  }
}

export function generateGoogleMapsDirectionsUrl(coordinates: string): string {
  if (!coordinates) return '';
  
  // This function would parse the coordinates and generate a Google Maps directions URL
  // For demo purposes, returning a placeholder
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates)}`;
}

export function formatDateTimeAgo(date: Date | string): string {
  if (!date) return '';
  
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
}
