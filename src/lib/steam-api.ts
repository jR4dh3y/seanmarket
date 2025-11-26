import { SteamPriceOverview } from "./types";
import { getSkinImage } from "./skin-images";

// Note: Steam blocks server-side requests from some DCs. We might need a proxy or just try direct.
// For this demo, we'll try direct and handle errors.

export async function fetchSkinImage(marketHashName: string): Promise<string | null> {
  // Use the pre-built skin image cache from the CSGO API
  return getSkinImage(marketHashName);
}

export async function fetchSkinPrice(marketHashName: string): Promise<{ price: number; average: number; currency: string } | null> {
  try {
    // Using a public API for easier access without strict rate limits/blocks for the demo if possible.
    // SteamAnalyst or similar is better but requires keys.
    // We will try to use the Steam Market API directly.
    
    const encodedName = encodeURIComponent(marketHashName);
    const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=24&market_hash_name=${encodedName}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`Failed to fetch price for ${marketHashName}: ${response.status}`);
      return null;
    }

    const data: SteamPriceOverview = await response.json();
    
    if (!data.success) return null;

    // Parse prices (e.g., "$12.50")
    const parsePrice = (priceStr?: string) => {
      if (!priceStr) return 0;
      return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    };

    const current = parsePrice(data.lowest_price);
    const median = parsePrice(data.median_price); // Using median as a proxy for average if 7d not explicitly available in this endpoint

    return {
      price: current,
      average: median, // This is technically median, but serves the purpose for "average" comparison
      currency: '₹' // Assuming INR for now
    };
  } catch (error) {
    console.error("Error fetching skin price:", error);
    return null;
  }
}

export async function searchSkins(query: string): Promise<string[]> {
    // In a real app, we'd query a database or a cached list of all skins.
    // For this MVP, we'll just return the query as a potential match if it looks like a skin name,
    // or maybe fetch from a list if we can find one.
    // Let's just return the query itself to allow the user to type the exact name for now.
    return [query];
}
