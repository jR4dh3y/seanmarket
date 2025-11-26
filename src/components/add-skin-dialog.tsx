"use client";

/**
 * AddSkinDialog Component
 * Modal dialog for adding new skins to the tracking list.
 * Features:
 * - Accepts Steam Market URLs or skin market hash names
 * - Validates input and handles submission
 * - Shows loading state during API request
 * - Provides user feedback via toast notifications
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddSkinDialogProps {
  onSkinAdded: () => void;
}

export function AddSkinDialog({ onSkinAdded }: AddSkinDialogProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle form submission to add new skin to tracking list
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      // Send skin data to API endpoint
      const response = await fetch("/api/skins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add skin");
      }

      toast.success("Skin added successfully!", {
        description: data.skin.market_hash_name,
      });
      setInput("");
      setOpen(false);
      onSkinAdded();
    } catch (error) {
      toast.error("Failed to add skin", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    /* DIALOG CONTAINER - modal wrapper | open/onOpenChange (state control) */
    <Dialog open={open} onOpenChange={setOpen}>
      {/* DIALOG TRIGGER BUTTON - asChild (render as Button component) */}
      <DialogTrigger asChild>
        {/* ADD BUTTON - shows on main page */}
        <Button>
          {/* BUTTON ICON - mr-2 (right margin) | h-4 w-4 (size) */}
          <Plus className="mr-2 h-4 w-4" />
          Add Skin
        </Button>
      </DialogTrigger>
      
      {/* DIALOG CONTENT - sm:max-w-[500px] (max width on small screens) */}
      <DialogContent className="sm:max-w-[500px]">
        {/* FORM */}
        <form onSubmit={handleSubmit}>
          
          {/* ========== DIALOG HEADER ========== */}
          <DialogHeader>
            {/* DIALOG TITLE - appears at top of modal */}
            <DialogTitle>Add Skin to Track</DialogTitle>
            
            {/* DIALOG DESCRIPTION - helper text below title */}
            <DialogDescription>
              Enter a Steam Market URL or the exact market hash name of the skin
              you want to track.
            </DialogDescription>
          </DialogHeader>
          
          {/* ========== INPUT SECTION ========== */}
          {/* py-4 (vertical padding) */}
          <div className="py-4">
            {/* INPUT FIELD - placeholder (example text) | disabled when loading */}
            <Input
              placeholder="e.g., AK-47 | Redline (Field-Tested) or Steam Market URL"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            
            {/* HELPER TEXT - text-xs (small size) | mt-2 (top margin) */}
            <p className="text-xs text-muted-foreground mt-2">
              Tip: You can paste the full Steam Market URL and we&apos;ll extract
              the skin name for you.
            </p>
          </div>
          
          {/* ========== DIALOG FOOTER (BUTTONS) ========== */}
          <DialogFooter>
            {/* CANCEL BUTTON - variant outline (border style) */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            {/* SUBMIT BUTTON - shows loading state or "Add Skin" text */}
            <Button type="submit" disabled={loading || !input.trim()}>
              { /* LOADING STATE - shows spinner and "Adding..." text */}
              {/* SPINNER ICON - mr-2 (right margin) | animate-spin (rotation animation) */}
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Skin"
              )}
              {/* NORMAL STATE - shows "Add Skin" text */}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
