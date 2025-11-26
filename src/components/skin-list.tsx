"use client";

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
  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <Skeleton className="w-full md:w-48 h-32" />
                <div className="flex-1 p-4 space-y-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
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

  if (skins.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <PackageOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            No skins tracked yet
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add a skin to start tracking its price
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
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
