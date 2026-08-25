"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { updateDisplayName } from "@/app/(app)/profile/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export function EditNameForm({ name }: { name: string }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateDisplayName(formData);
        toast.success("Name updated");
        setEditing(false);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-sm text-brand-foreground/80 underline underline-offset-2"
      >
        <Pencil className="size-3.5" />
        Edit name
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Label htmlFor="full_name" className="sr-only">
        Name
      </Label>
      <Input
        id="full_name"
        name="full_name"
        defaultValue={name}
        autoFocus
        className="h-8 flex-1 bg-white/10 text-brand-foreground placeholder:text-brand-foreground/50"
        placeholder="Your name"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
