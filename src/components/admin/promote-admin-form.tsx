"use client";

import { useRef, useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { promoteToAdmin } from "@/app/admin/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function PromoteAdminForm() {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await promoteToAdmin(formData);
        toast.success("Promoted to admin");
        formRef.current?.reset();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2">
      <Input
        name="email"
        type="email"
        required
        placeholder="Promote by email (account must already exist)"
        className="border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
      />
      <Button type="submit" size="icon" disabled={pending} aria-label="Promote to admin">
        <UserPlus className="size-4" />
      </Button>
    </form>
  );
}
