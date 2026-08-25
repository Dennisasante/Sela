"use client";

import { useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { updatePassword } from "@/app/(app)/profile/actions";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ChangePasswordForm() {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await updatePassword(formData);
        toast.success("Password updated");
        form.reset();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="new_password">New password</Label>
        <PasswordInput id="new_password" name="new_password" required minLength={6} autoComplete="new-password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirm new password</Label>
        <PasswordInput id="confirm_password" name="confirm_password" required minLength={6} autoComplete="new-password" />
      </div>
      <Button type="submit" size="sm" disabled={pending} className="w-full">
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
