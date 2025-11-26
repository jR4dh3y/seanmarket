"use client";

/**
 * StatsCards Component
 * Displays overview statistics about tracked skins.
 * Features:
 * - Shows total number of tracked skins
 * - Displays total portfolio value vs average price
 * - Counts good deals (below average) and bad deals (above average)
 * - Shows overall portfolio trend percentage
 */

import { Skin } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, IndianRupee, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  skins: Skin[];
}

export function StatsCards({ skins }: StatsCardsProps) {
  // Calculate total current value of all tracked skins
  const totalValue = skins.reduce((sum, skin) => sum + skin.current_price, 0);
  
  // Calculate total 7-day average value for comparison
  const totalAverage = skins.reduce((sum, skin) => sum + skin.average_price_7d, 0);
  
  // Count skins currently priced below their 7-day average (good deals)
  const goodDeals = skins.filter(
    (skin) => skin.current_price < skin.average_price_7d
  ).length;
  
  // Count skins currently priced above their 7-day average (bad deals)
  const badDeals = skins.filter(
    (skin) => skin.current_price > skin.average_price_7d
  ).length;

  // Calculate overall portfolio performance compared to average
  const overallDiff = totalValue - totalAverage;
  const overallPercent = totalAverage > 0
    ? ((overallDiff / totalAverage) * 100).toFixed(1)
    : "0";

  const currencySymbol = skins[0]?.currency_symbol || "₹";

  return (
    /* STATS GRID CONTAINER - grid (creates grid) | gap-4 (space between cards) | md:grid-cols-2 (2 columns on medium) | lg:grid-cols-4 (4 columns on large) */
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      
      {/* ========== STAT CARD 1: TRACKED SKINS ========== */}
      <Card>
        {/* CARD HEADER - flex flex-row (horizontal layout) | justify-between (space apart) | space-y-0 (no gap between items) | pb-2 (bottom padding) */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          {/* CARD TITLE - text-sm (size) | font-medium (weight) */}
          <CardTitle className="text-sm font-medium">Tracked Skins</CardTitle>
          
          {/* CARD ICON - h-4 w-4 (size) | text-muted-foreground (color) */}
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        
        {/* CARD CONTENT */}
        <CardContent>
          {/* LARGE NUMBER - text-2xl (size) | font-bold (weight) */}
          <div className="text-2xl font-bold">{skins.length}</div>
          
          {/* DESCRIPTION - text-xs (size) */}
          <p className="text-xs text-muted-foreground">
            skins in your watchlist
          </p>
        </CardContent>
      </Card>

      {/* ========== STAT CARD 2: TOTAL VALUE ========== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalValue, currencySymbol)}
          </div>
          <p className="text-xs text-muted-foreground">
            vs {formatCurrency(totalAverage, currencySymbol)} avg
          </p>
        </CardContent>
      </Card>

      {/* ========== STAT CARD 3: GOOD DEALS ========== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Good Deals</CardTitle>
          {/* ICON - text-green-500 (color for good deals) */}
          <TrendingDown className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          {/* COUNT NUMBER - text-green-500 (color matches icon) */}
          <div className="text-2xl font-bold text-green-500">{goodDeals}</div>
          <p className="text-xs text-muted-foreground">
            skins below average price
          </p>
        </CardContent>
      </Card>

      {/* ========== STAT CARD 4: OVERALL TREND ========== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Trend</CardTitle>
          {/* CONDITIONAL ICON - shows green down (good) or red up (bad) */}
          {overallDiff < 0 ? (
            <TrendingDown className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingUp className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          {/* TREND PERCENTAGE - color depends on overallDiff (negative=green, positive=red) */}
          <div
            className={`text-2xl font-bold ${
              overallDiff < 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {overallDiff < 0 ? "" : "+"}
            {overallPercent}%
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(Math.abs(overallDiff), currencySymbol)}{" "}
            {overallDiff < 0 ? "savings" : "premium"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
