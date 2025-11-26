"use client";

/**
 * SkinList Component
 * Renders a list of tracked skins with loading and empty states.
 * Features:
 * - Displays skeleton loaders while fetching data
 * - Shows empty state when no skins are tracked
 * - Maps through skins array to render individual SkinCard components
 */

import { Skin } from "@/lib/types";
import { SkinCard } from "./skin-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { PackageOpen } from "lucide-react";

interface SkinListProps {
  skins: Skin[];
  loading: boolean;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function SkinList({ skins, loading, onDelete, onRefresh }: SkinListProps) {
  // LOADING STATE - Shows skeleton loaders while fetching data
  if (loading) {
    return (
      /* GRID CONTAINER - gap-4 (space between skeleton cards) */
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          /* SKELETON CARD - mimics the real card structure */
          <Card key={i}>
            {/* CARD CONTENT - p-0 (no padding) */}
            <CardContent className="p-0">
              {/* FLEX LAYOUT - flex-col (mobile) md:flex-row (desktop) */}
              <div className="flex flex-col md:flex-row">
                {/* SKELETON IMAGE - w-full md:w-48 (width) | h-32 (height) */}
                <Skeleton className="w-full md:w-48 h-32" />
                
                {/* SKELETON CONTENT AREA - flex-1 (remaining space) | p-4 (padding) | space-y-4 (gap between skeleton lines) */}
                <div className="flex-1 p-4 space-y-4">
                  {/* SKELETON TITLE LINE - h-5 w-3/4 (size) */}
                  <Skeleton className="h-5 w-3/4" />
                  
                  {/* SKELETON SUBTITLE LINE - h-4 w-1/4 (size) */}
                  <Skeleton className="h-4 w-1/4" />
                  
                  {/* SKELETON BUTTONS & BADGE - gap-4 (space between elements) */}
                  <div className="flex gap-4">
                    {/* SKELETON BUTTON 1 - h-8 w-24 (size) */}
                    <Skeleton className="h-8 w-24" />
                    
                    {/* SKELETON BUTTON 2 - h-8 w-24 (size) */}
                    <Skeleton className="h-8 w-24" />
                    
                    {/* SKELETON BADGE - h-6 w-16 (size) | ml-auto (pushes to right) */}
                    <Skeleton className="h-6 w-16 ml-auto" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // EMPTY STATE - Shows when no skins are tracked
  if (skins.length === 0) {
    return (
      /* EMPTY CARD */
      <Card>
        {/* CARD CONTENT - flex flex-col (stack vertically) | items-center justify-center (center content) | py-16 (vertical padding) */}
        <CardContent className="flex flex-col items-center justify-center py-16">
          {/* EMPTY ICON - h-16 w-16 (size) | text-muted-foreground/50 (color opacity) | mb-4 (bottom margin) */}
          <PackageOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
          
          {/* EMPTY TITLE - text-lg (size) | font-semibold (weight) */}
          <h3 className="text-lg font-semibold text-muted-foreground">
            No skins tracked yet
          </h3>
          
          {/* EMPTY SUBTITLE - text-sm (size) | mt-1 (top margin) */}
          <p className="text-sm text-muted-foreground mt-1">
            Add a skin to start tracking its price
          </p>
        </CardContent>
      </Card>
    );
  }

  // NORMAL STATE - Renders list of SkinCard components
  return (
    /* GRID CONTAINER - gap-4 (space between cards) */
    <div className="grid gap-4">
      {skins.map((skin) => (
        <SkinCard
          key={skin.id}
          skin={skin}
          onDelete={onDelete}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
