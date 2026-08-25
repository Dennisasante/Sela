"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { MoreVertical, CheckCircle2, ExternalLink } from "lucide-react";
import {
  deleteWishlistItem,
  markWishlistItemPurchased,
} from "@/app/(app)/wishlist/actions";
import { formatMoney } from "@/lib/format";
import { withDataSlot } from "@/lib/utils";
import type { WishlistItemWithAffordability } from "@/lib/data/wishlist";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WishlistFormDialog } from "@/components/wishlist/wishlist-form-dialog";

const PRIORITY_VARIANT: Record<string, "secondary" | "info" | "destructive"> = {
  low: "secondary",
  medium: "info",
  high: "destructive",
};

export function WishlistItemCard({
  entry,
  currency,
}: {
  entry: WishlistItemWithAffordability;
  currency: string;
}) {
  const { item, canAffordNow, shortfall } = entry;
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  function handlePurchased() {
    startTransition(async () => {
      try {
        await markWishlistItemPurchased(item.id);
        toast.success(`Marked ${item.name} as purchased`);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteWishlistItem(item.id);
        toast.success("Removed from wishlist");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <>
      <Card>
        <CardContent className="space-y-2 py-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium">{item.name}</p>
                <Badge variant={PRIORITY_VARIANT[item.priority]} className="text-[10px]">
                  {item.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatMoney(item.estimated_price, currency)}
              </p>
              {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1 text-xs text-primary underline underline-offset-2"
                >
                  View item <ExternalLink className="size-3" />
                </a>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={withDataSlot(
                  <Button variant="ghost" size="icon" aria-label="Item actions">
                    <MoreVertical className="size-4" />
                  </Button>,
                  "dropdown-menu-trigger"
                )}
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
                <DropdownMenuItem disabled={pending} onClick={handlePurchased}>
                  <CheckCircle2 className="size-4" />
                  Mark purchased
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" disabled={pending} onClick={handleDelete}>
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {canAffordNow ? (
            <p className="rounded-md bg-success/10 p-2 text-xs text-success">
              You can afford this right now without touching your commitments.
            </p>
          ) : (
            <p className="rounded-md bg-info/10 p-2 text-xs text-info">
              You&apos;d need {formatMoney(shortfall, currency)} more to buy this safely today.
            </p>
          )}
        </CardContent>
      </Card>
      <WishlistFormDialog item={item} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
