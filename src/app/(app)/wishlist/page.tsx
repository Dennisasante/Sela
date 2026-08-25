import { createClient } from "@/lib/supabase/server";
import { getWishlistOverview } from "@/lib/data/wishlist";
import { formatMoney } from "@/lib/format";
import { WishlistItemCard } from "@/components/wishlist/wishlist-item-card";
import { WishlistFormDialog } from "@/components/wishlist/wishlist-form-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

export default async function WishlistPage() {
  const supabase = await createClient();
  const { items, safeToSpend, currency } = await getWishlistOverview(supabase);

  const wanted = items.filter((e) => e.item.status === "wanted");
  const purchased = items.filter((e) => e.item.status === "purchased");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Wishlist</h1>
          <p className="text-sm text-muted-foreground">
            Things you want, checked against what you can actually afford.
          </p>
        </div>
        <WishlistFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Add
            </Button>
          }
        />
      </div>

      <Card className="overflow-hidden border-none bg-gradient-to-br from-brand to-brand/80 text-brand-foreground">
        <CardContent className="py-4 text-center">
          <p className="text-sm text-brand-foreground/80">Safe to spend right now</p>
          <p className="mt-1 text-2xl font-semibold">{formatMoney(safeToSpend, currency)}</p>
        </CardContent>
      </Card>

      {wanted.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted">
            <Sparkles className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Nothing on your wishlist yet</p>
          <p className="max-w-[24rem] text-xs text-muted-foreground">
            Add something you want and Sela will tell you whether you can afford it today.
          </p>
          <WishlistFormDialog
            trigger={
              <Button size="sm" className="mt-1">
                <Plus className="size-4" />
                Add item
              </Button>
            }
          />
        </div>
      )}

      <div className="space-y-3">
        {wanted.map((entry) => (
          <WishlistItemCard key={entry.item.id} entry={entry} currency={currency} />
        ))}
      </div>

      {purchased.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Purchased</p>
          <div className="space-y-2">
            {purchased.map((entry) => (
              <Card key={entry.item.id}>
                <CardContent className="flex items-center justify-between py-3 text-sm text-muted-foreground">
                  <span className="line-through">{entry.item.name}</span>
                  <span>{formatMoney(entry.item.estimated_price, currency)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
