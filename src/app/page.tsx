"use client";

/**
 * Home Page Component
 * Main dashboard for CS2 Skin Price Tracker application.
 * Features:
 * - Fetches and displays tracked skins from API
 * - Provides add skin dialog for tracking new items
 * - Shows statistics overview of portfolio
 * - Allows batch refresh of all skin prices
 * - Theme toggle (dark/light mode)
 * - Individual skin management (delete, refresh)
 */

import { useEffect, useState, useCallback } from "react";
import { Skin } from "@/lib/types";
import { AddSkinDialog } from "@/components/add-skin-dialog";
import { SkinList } from "@/components/skin-list";
import { StatsCards } from "@/components/stats-cards";
import { Button } from "@/components/ui/button";
import { RefreshCw, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function Home() {
  // State management for skins, loading, and theme
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by tracking mount state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all tracked skins from API
  const fetchSkins = useCallback(async () => {
    try {
      const response = await fetch("/api/skins");
      const data = await response.json();
      setSkins(data.skins || []);
    } catch (error) {
      console.error("Error fetching skins:", error);
      toast.error("Failed to load skins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkins();
  }, [fetchSkins]);

  // Refresh prices for all tracked skins from Steam Market
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/skins/refresh", { method: "POST" });
      if (!response.ok) throw new Error("Failed to refresh");
      
      const data = await response.json();
      setSkins(data.skins);
      toast.success("All prices updated!");
    } catch (error) {
      toast.error("Failed to refresh prices");
    } finally {
      setRefreshing(false);
    }
  };

  // Remove skin from local state when deleted
  const handleDeleteSkin = (id: string) => {
    setSkins((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CS</span>
            </div>
            <h1 className="text-xl font-bold">CS2 Market Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Current Prices of Your Tracked CS2 Skins
          </h2>
          <p className="text-muted-foreground mt-2">
            Monitor real-time market prices and trends for your favorite CS2 skins.
          </p>
        </div>

        {/* Stats Cards */}
        {!loading && skins.length > 0 && (
          <div className="mb-8">
            <StatsCards skins={skins} />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <AddSkinDialog onSkinAdded={fetchSkins} />
          {skins.length > 0 && (
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh All"}
            </Button>
          )}
        </div>

        {/* Skin List */}
        <SkinList
          skins={skins}
          loading={loading}
          onDelete={handleDeleteSkin}
          onRefresh={fetchSkins}
        />
      </main>

      {/* Footer */}
      <footer className="border-t h-16 flex items-center shrink-0">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Prices fetched from Steam Community Market. Data may be delayed.
          </p>
        </div>
      </footer>
    </div>
  );
}
