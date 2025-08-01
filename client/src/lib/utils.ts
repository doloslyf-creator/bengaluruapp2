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

// Format price in crores for admin panels
export function formatPriceInCrores(price: number): string {
  if (price === 0) return "₹0 Cr";
  const crores = price / 10000000; // Convert to crores (1 crore = 10,000,000)
  if (crores >= 1) {
    return `₹${crores.toFixed(2)} Cr`;
  } else {
    const lakhs = price / 100000; // Convert to lakhs (1 lakh = 100,000)
    return `₹${lakhs.toFixed(2)} L`;
  }
}
