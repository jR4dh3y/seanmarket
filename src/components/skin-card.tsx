"use client";

/**
 * SkinCard Component
 * Displays individual skin information with price comparison and action buttons.
 * Features:
 * - Shows skin image, name, and current pricing
 * - Compares current price against 7-day average
 * - Provides visual indicators for good/bad deals
 * - Allows users to delete skins or refresh prices
 */

import { Skin } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface SkinCardProps {
  skin: Skin;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function SkinCard({ skin, onDelete, onRefresh }: SkinCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate price difference and percentage compared to 7-day average
  const priceDiff = skin.current_price - skin.average_price_7d;
  const priceDiffPercent = skin.average_price_7d > 0
    ? ((priceDiff / skin.average_price_7d) * 100).toFixed(1)
    : "0";

  // Determine if the current price is a good or bad deal
  const isGoodDeal = priceDiff < 0;
  const isBadDeal = priceDiff > 0;

  // Remove skin from tracking list
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/skins?id=${skin.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete skin");
      }

      toast.success("Skin removed", {
        description: skin.market_hash_name,
      });
      onDelete(skin.id);
    } catch (error) {
      toast.error("Failed to delete skin");
    } finally {
      setDeleting(false);
    }
  };

  // Fetch latest price data from Steam Market for this skin
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/skins/refresh?id=${skin.id}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh price");
      }

      toast.success("Price updated");
      onRefresh();
    } catch (error) {
      toast.error("Failed to refresh price");
    } finally {
      setRefreshing(false);
    }
  };

  const lastUpdatedDate = new Date(skin.last_updated);
  const timeAgo = getTimeAgo(lastUpdatedDate);

  // Generate a Steam market image URL from the skin name if no image is available
  const getImageUrl = () => {
    if (skin.image && skin.image.length > 10) {
      return skin.image;
    }
    // Fallback: use a placeholder
    return `https://placehold.co/150x100/1a1a2e/ffffff?text=${encodeURIComponent(skin.market_hash_name.split('|')[0].trim())}`;
  };

  return (
    /* CARD CONTAINER - controls overall card styling and shadow */
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* CARD CONTENT WRAPPER - p-0 (no padding) | pl-4 (left padding on card) */}
      <CardContent className="p-0 pl-4">
        {/* FLEX CONTAINER - flex-col (mobile) md:flex-row (desktop layout) */}
        <div className="flex flex-col md:flex-row">
          
          {/* ========== IMAGE SECTION ========== */}
          {/* Controls: w-full md:w-48 (width) | h-32 md:h-auto (height) | p-4 (padding inside image box) */}
          <div className="relative w-full md:w-48 h-32 md:h-auto bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center p-4">
            <img
              src={getImageUrl()}
              alt={skin.market_hash_name}
              className="max-h-24 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/150x100/1a1a2e/ffffff?text=${encodeURIComponent(skin.market_hash_name.split('|')[0].trim())}`;
              }}
            />
          </div>

          {/* ========== CONTENT SECTION ========== */}
          {/* flex-1 (takes remaining space) | p-4 (internal padding for text) */}
          <div className="flex-1 p-4">
            
            {/* HEADER ROW - Skin name + Action buttons */}
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                {/* SKIN TITLE - text-sm md:text-base (responsive font size) */}
                <h3 className="font-semibold text-sm md:text-base truncate" title={skin.market_hash_name}>
                  {skin.market_hash_name}
                </h3>
                {/* LAST UPDATED TEXT */}
                <p className="text-xs text-muted-foreground mt-1">
                  Updated {timeAgo}
                </p>
              </div>
              
              {/* ACTION BUTTONS - gap-1 (space between buttons) */}
              <div className="flex gap-1">
                {/* REFRESH BUTTON */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
                
                {/* DELETE BUTTON */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ========== PRICE SECTION ========== */}
            {/* mt-4 (top margin) | gap-4 (space between price boxes) */}
            <div className="mt-4 flex flex-wrap items-end gap-4">
              
              {/* CURRENT PRICE BOX */}
              <div>
                <p className="text-xs text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(skin.current_price, skin.currency_symbol)}
                </p>
              </div>

              {/* 7-DAY AVERAGE PRICE BOX */}
              <div>
                <p className="text-xs text-muted-foreground">7D Average</p>
                <p className="text-lg text-muted-foreground">
                  {formatCurrency(skin.average_price_7d, skin.currency_symbol)}
                </p>
              </div>

              {/* PRICE DIFFERENCE BADGE - ml-auto (pushes to right) */}
              <div className="ml-auto">
                <Badge
                  variant={isGoodDeal ? "default" : isBadDeal ? "destructive" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {isGoodDeal ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : isBadDeal ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {priceDiffPercent}%
                </Badge>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {isGoodDeal ? "Below avg" : isBadDeal ? "Above avg" : "At avg"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
