"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { addExpense } from "@/app/(app)/add/actions";
import type { Account, Event, ExpenseCategory, Project } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toISODate } from "@/lib/format";
import { ChevronDown } from "lucide-react";

export function AddExpenseForm({
  accounts,
  categories,
  events,
  projects,
}: {
  accounts: Account[];
  categories: ExpenseCategory[];
  events: Event[];
  projects: Project[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showMore, setShowMore] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await addExpense(formData);
        toast.success("Expense logged");
        router.push("/expenses");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add an account first before logging an expense.
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
        <Label htmlFor="category_id">Category</Label>
        <Select name="category_id" required>
          <SelectTrigger id="category_id" className="w-full">
            <SelectValue>
              {(value: string | null) =>
                value
                  ? (categories.find((c) => c.id === value)?.name ?? value)
                  : "Select category"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="account_id">Paid from</Label>
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

      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ChevronDown className={`size-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
        More details
      </button>

      {showMore && (
        <div className="space-y-4 rounded-md border p-3">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payee">Payee</Label>
            <Input id="payee" name="payee" />
          </div>
          {events.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="event_id">Event / budget</Label>
              <Select name="event_id" defaultValue="none">
                <SelectTrigger id="event_id" className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value === "none"
                        ? "None"
                        : (events.find((ev) => ev.id === value)?.name ?? value)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {events.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>
                      {ev.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {projects.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="project_id">Project (business expense)</Label>
              <Select name="project_id" defaultValue="none">
                <SelectTrigger id="project_id" className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value === "none"
                        ? "None"
                        : (projects.find((p) => p.id === value)?.title ?? value)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input id="is_gift" name="is_gift" type="checkbox" className="size-4" />
            <Label htmlFor="is_gift" className="font-normal">
              This is a gift (money given away)
            </Label>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save expense"}
      </Button>
    </form>
  );
}
