"use client";

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

  const priceDiff = skin.current_price - skin.average_price_7d;
  const priceDiffPercent = skin.average_price_7d > 0
    ? ((priceDiff / skin.average_price_7d) * 100).toFixed(1)
    : "0";

  const isGoodDeal = priceDiff < 0;
  const isBadDeal = priceDiff > 0;

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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Image section */}
          <div className="relative w-full md:w-48 h-32 md:h-auto bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center p-4">
            <img
              src={skin.image || "/placeholder-skin.png"}
              alt={skin.market_hash_name}
              className="max-h-24 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image";
              }}
            />
          </div>

          {/* Content section */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-base truncate" title={skin.market_hash_name}>
                  {skin.market_hash_name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Updated {timeAgo}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
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

            {/* Price section */}
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(skin.current_price, skin.currency_symbol)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">7D Average</p>
                <p className="text-lg text-muted-foreground">
                  {formatCurrency(skin.average_price_7d, skin.currency_symbol)}
                </p>
              </div>

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
