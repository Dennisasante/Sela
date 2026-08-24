"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addIncome } from "@/app/(app)/add/actions";
import type { Account, IncomeSource, Project } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toISODate } from "@/lib/format";

export function AddIncomeForm({
  sources,
  projects,
  accounts,
}: {
  sources: IncomeSource[];
  projects: Project[];
  accounts: Account[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isProductSale, setIsProductSale] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await addIncome(formData);
        toast.success("Income logged");
        router.push("/income");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add an account first before logging income.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" required autoFocus />
      </div>

      <div className="space-y-2">
        <Label htmlFor="account_id">Received into</Label>
        <Select name="account_id" required>
          <SelectTrigger id="account_id" className="w-full">
            <SelectValue>
              {(value: string | null) =>
                value ? (accounts.find((a) => a.id === value)?.name ?? value) : "Select account"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={toISODate(new Date())}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" name="description" placeholder="What was this for?" />
      </div>

      <Card>
        <CardContent className="flex items-center justify-between py-3">
          <div>
            <Label htmlFor="is_product_sale">Product sale</Label>
            <p className="text-xs text-muted-foreground">Track quantity, cost, and profit</p>
          </div>
          <Switch
            id="is_product_sale"
            name="is_product_sale"
            checked={isProductSale}
            onCheckedChange={setIsProductSale}
          />
        </CardContent>
      </Card>

      {isProductSale ? (
        <div className="space-y-4 rounded-md border p-3">
          <div className="space-y-2">
            <Label htmlFor="product_name">Product name</Label>
            <Input id="product_name" name="product_name" required={isProductSale} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                defaultValue={1}
                required={isProductSale}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selling_price_per_unit">Selling price / unit</Label>
              <Input
                id="selling_price_per_unit"
                name="selling_price_per_unit"
                type="number"
                step="0.01"
                required={isProductSale}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_price_per_unit">Cost price / unit</Label>
              <Input
                id="cost_price_per_unit"
                name="cost_price_per_unit"
                type="number"
                step="0.01"
                defaultValue={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_fee">Delivery fee</Label>
              <Input
                id="delivery_fee"
                name="delivery_fee"
                type="number"
                step="0.01"
                defaultValue={0}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="source_id">Client / source (optional)</Label>
            <Select name="source_id" defaultValue="none">
              <SelectTrigger id="source_id" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === "none"
                      ? "One-off / no source"
                      : (sources.find((s) => s.id === value)?.name ?? value)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">One-off / no source</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {projects.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="project_id">Project (optional)</Label>
              <Select name="project_id" defaultValue="none">
                <SelectTrigger id="project_id" className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value === "none"
                        ? "Not tied to a project"
                        : (projects.find((p) => p.id === value)?.title ?? value)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not tied to a project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      <div className="flex items-center gap-2">
        <input
          id="include_in_tax_base"
          name="include_in_tax_base"
          type="checkbox"
          defaultChecked
          className="size-4"
        />
        <Label htmlFor="include_in_tax_base" className="font-normal">
          Include in tax/savings % calculations
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save income"}
      </Button>
    </form>
  );
}
