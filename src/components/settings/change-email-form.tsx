"use client";

import { useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { updateEmail } from "@/app/(app)/profile/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await updateEmail(formData);
        toast.success("Check your new email address to confirm the change");
        form.reset();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Current email: <span className="text-foreground">{currentEmail}</span>
      </p>
      <div className="space-y-2">
        <Label htmlFor="new_email">New email</Label>
        <Input id="new_email" name="new_email" type="email" required autoComplete="email" />
      </div>
      <Button type="submit" size="sm" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Update email"}
      </Button>
    </form>
  );
}
