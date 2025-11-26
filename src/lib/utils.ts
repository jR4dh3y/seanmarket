import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractMarketHashName(input: string): string {
  // Handle full URL: https://steamcommunity.com/market/listings/730/MP9%20%7C%20Starlight%20Protector%20%28Field-Tested%29
  if (input.includes('steamcommunity.com/market/listings/730/')) {
    const parts = input.split('/730/');
    if (parts.length > 1) {
      // Decode URI component to get "MP9 | Starlight Protector (Field-Tested)"
      // Remove any query parameters if present
      let name = parts[1].split('?')[0];
      return decodeURIComponent(name);
    }
  }
  // Return as is if it doesn't look like a URL (assume it's already the name)
  return input;
}

export function formatCurrency(amount: number, symbol: string = '₹') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount).replace('₹', symbol);
}
