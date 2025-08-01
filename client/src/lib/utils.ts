import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in crores with proper decimals
export function formatPrice(price: number): string {
  if (price === 0) return "₹0 Cr";
  return `₹${(price / 100).toFixed(2)} Cr`;
}

// Format price for display with appropriate precision
export function formatPriceDisplay(price: number): string {
  if (price === 0) return "₹0 Cr";
  const crores = price / 100;
  return `₹${crores.toFixed(1)} Cr`;
}
