"use client";

import { Skin } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  skins: Skin[];
}

export function StatsCards({ skins }: StatsCardsProps) {
  const totalValue = skins.reduce((sum, skin) => sum + skin.current_price, 0);
  const totalAverage = skins.reduce((sum, skin) => sum + skin.average_price_7d, 0);
  
  const goodDeals = skins.filter(
    (skin) => skin.current_price < skin.average_price_7d
  ).length;
  
  const badDeals = skins.filter(
    (skin) => skin.current_price > skin.average_price_7d
  ).length;

  const overallDiff = totalValue - totalAverage;
  const overallPercent = totalAverage > 0
    ? ((overallDiff / totalAverage) * 100).toFixed(1)
    : "0";

  const currencySymbol = skins[0]?.currency_symbol || "$";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tracked Skins</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{skins.length}</div>
          <p className="text-xs text-muted-foreground">
            skins in your watchlist
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Good Deals</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{goodDeals}</div>
          <p className="text-xs text-muted-foreground">
            skins below average price
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Trend</CardTitle>
          {overallDiff < 0 ? (
            <TrendingDown className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingUp className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
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
