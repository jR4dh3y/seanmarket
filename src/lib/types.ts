export interface Skin {
  id: string;
  market_hash_name: string;
  image: string;
  current_price: number;
  average_price_7d: number;
  last_updated: number;
  currency_symbol: string;
}

export interface SteamPriceOverview {
  success: boolean;
  lowest_price?: string;
  volume?: string;
  median_price?: string;
}
