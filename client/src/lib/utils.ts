import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Dynamic price formatting with proper Lakh/Crore units
export function formatPrice(price: number): string {
  if (price === 0) return "₹0";
  
  const onecrore = 10000000; // 1 crore = 1,00,00,000
  const onelakh = 100000;    // 1 lakh = 1,00,000
  
  if (price >= onecrore) {
    const crores = price / onecrore;
    // Remove unnecessary decimals for whole numbers
    if (crores % 1 === 0) {
      return `₹${crores} Cr`;
    }
    // Limit to 2 decimal places for precision
    return `₹${parseFloat(crores.toFixed(2))} Cr`;
  } else {
    const lakhs = price / onelakh;
    // Remove unnecessary decimals for whole numbers
    if (lakhs % 1 === 0) {
      return `₹${lakhs} Lakh`;
    }
    // Limit to 1 decimal place for lakhs
    return `₹${parseFloat(lakhs.toFixed(1))} Lakh`;
  }
}

// Format price for display with appropriate precision  
export function formatPriceCrores(price: number): string {
  return formatPrice(price);
}

// Format price in crores for admin panels (using new dynamic format)
export function formatPriceInCrores(price: number): string {
  return formatPrice(price);
}

// Format price range display for properties with dynamic units
export function formatPriceDisplay(startingPrice: number, maxPrice?: number): string {
  const formatSinglePrice = (price: number) => {
    const onecrore = 10000000;
    const onelakh = 100000;
    
    if (price >= onecrore) {
      const crores = price / onecrore;
      if (crores % 1 === 0) {
        return `₹${crores} Cr`;
      }
      return `₹${parseFloat(crores.toFixed(2))} Cr`;
    } else {
      const lakhs = price / onelakh;
      if (lakhs % 1 === 0) {
        return `₹${lakhs} Lakh`;
      }  
      return `₹${parseFloat(lakhs.toFixed(1))} Lakh`;
    }
  };
  
  if (!maxPrice || maxPrice === startingPrice) {
    return formatSinglePrice(startingPrice);
  }
  
  return `${formatSinglePrice(startingPrice)} - ${formatSinglePrice(maxPrice)}`;
}
