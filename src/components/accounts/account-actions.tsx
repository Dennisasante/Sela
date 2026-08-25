"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { MoreVertical } from "lucide-react";
import { setAccountActive } from "@/app/(app)/accounts/actions";
import type { Account } from "@/lib/supabase/types";
import { withDataSlot } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";

export function AccountActions({ account }: { account: Account }) {
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggleActive() {
    startTransition(async () => {
      try {
        await setAccountActive(account.id, !account.is_active);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={withDataSlot(
            <Button variant="ghost" size="icon" aria-label="Account actions">
              <MoreVertical className="size-4" />
            </Button>,
            "dropdown-menu-trigger"
          )}
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
          <DropdownMenuItem disabled={pending} onClick={toggleActive}>
            {account.is_active ? "Hide" : "Unhide"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AccountFormDialog account={account} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
