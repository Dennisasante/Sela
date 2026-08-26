"use client";

import { useTransition } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { MoreVertical, ShieldCheck } from "lucide-react";
import {
  confirmUserEmail,
  resendUserConfirmation,
  setUserBanned,
  deleteUserAccount,
  demoteAdmin,
} from "@/app/admin/actions";
import { withDataSlot } from "@/lib/utils";
import type { AdminUserRow as Row } from "@/lib/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function formatDateTime(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminUserRow({ row }: { row: Row }) {
  const [pending, startTransition] = useTransition();
  const isBanned = !!row.bannedUntil;

  function handleConfirmEmail() {
    startTransition(async () => {
      try {
        await confirmUserEmail(row.id);
        toast.success("Email confirmed");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleResend() {
    if (!row.email) return;
    startTransition(async () => {
      try {
        await resendUserConfirmation(row.email!);
        toast.success("Confirmation email resent");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleToggleBan() {
    startTransition(async () => {
      try {
        await setUserBanned(row.id, !isBanned);
        toast.success(isBanned ? "User unsuspended" : "User suspended");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteUserAccount(row.id);
        toast.success("Account deleted");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleDemote() {
    startTransition(async () => {
      try {
        await demoteAdmin(row.id);
        toast.success("Admin access removed");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <Card className="border-neutral-800 bg-neutral-900 text-white">
      <CardContent className="space-y-2 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate font-medium">{row.email ?? "(no email)"}</p>
            {row.isAdmin && (
              <Badge variant="info" className="shrink-0 gap-1">
                <ShieldCheck className="size-3" />
                Admin
              </Badge>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {isBanned && (
              <Badge variant="destructive">Suspended</Badge>
            )}
            <Badge variant={row.emailConfirmed ? "success" : "secondary"}>
              {row.emailConfirmed ? "Verified" : "Unverified"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={withDataSlot(
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="User actions"
                    className="text-neutral-300 hover:text-white"
                  >
                    <MoreVertical className="size-4" />
                  </Button>,
                  "dropdown-menu-trigger"
                )}
              />
              <DropdownMenuContent align="end">
                {!row.emailConfirmed && (
                  <>
                    <DropdownMenuItem disabled={pending} onClick={handleConfirmEmail}>
                      Confirm email manually
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={pending} onClick={handleResend}>
                      Resend confirmation email
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem disabled={pending} onClick={handleToggleBan}>
                  {isBanned ? "Unsuspend account" : "Suspend account"}
                </DropdownMenuItem>
                {row.isAdmin && (
                  <DropdownMenuItem disabled={pending} onClick={handleDemote}>
                    Remove admin access
                  </DropdownMenuItem>
                )}
                {!row.isAdmin && (
                  <DropdownMenuItem variant="destructive" disabled={pending} onClick={handleDelete}>
                    Delete account
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-400">
          <span>Signed up {formatDateTime(row.createdAt)}</span>
          <span>Last sign-in {formatDateTime(row.lastSignInAt)}</span>
          <span>{row.accounts} account{row.accounts === 1 ? "" : "s"}</span>
          <span>{row.expenses} expense{row.expenses === 1 ? "" : "s"}</span>
          <span>{row.incomeEntries} income entr{row.incomeEntries === 1 ? "y" : "ies"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
