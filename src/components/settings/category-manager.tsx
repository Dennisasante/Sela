"use client";

import { useTransition, useRef } from "react";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { createCategory, deleteCategory } from "@/app/(app)/settings/actions";
import type { ExpenseCategory } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CategoryManager({ categories }: { categories: ExpenseCategory[] }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createCategory(formData);
        formRef.current?.reset();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteCategory(id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Badge key={c.id} variant="secondary" className="gap-1 py-1 pl-2.5 pr-1.5">
            {c.name}
            <button
              type="button"
              aria-label={`Remove ${c.name}`}
              disabled={pending}
              onClick={() => handleDelete(c.id)}
              className="rounded-full p-0.5 hover:bg-foreground/10"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <form ref={formRef} onSubmit={handleAdd} className="flex gap-2">
        <Input name="name" placeholder="New category" required className="flex-1" />
        <Button type="submit" size="icon" disabled={pending} aria-label="Add category">
          <Plus className="size-4" />
        </Button>
      </form>
    </div>
  );
}
