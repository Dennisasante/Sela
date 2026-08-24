import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format";
import { getAccountIcon } from "@/lib/account-style";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeftRight } from "lucide-react";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { TransferDialog } from "@/components/accounts/transfer-dialog";
import { AccountActions } from "@/components/accounts/account-actions";
import type { Account } from "@/lib/supabase/types";

export default async function AccountsPage() {
  const supabase = await createClient();

  const [{ data: balances }, { data: accounts }] = await Promise.all([
    supabase.from("account_balances").select("*").order("name"),
    supabase.from("accounts").select("*").order("name"),
  ]);

  const activeAccounts = (accounts ?? []).filter((a) => a.is_active) as Account[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Accounts</h1>
        <div className="flex gap-2">
          <TransferDialog
            accounts={activeAccounts}
            trigger={
              <Button size="sm" variant="outline">
                <ArrowLeftRight className="size-4" />
                Transfer
              </Button>
            }
          />
          <AccountFormDialog
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                Add
              </Button>
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        {(balances ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">
            No accounts yet — add your first wallet.
          </p>
        )}
        {(balances ?? []).map((account) => {
          const fullAccount = (accounts ?? []).find(
            (a) => a.id === account.account_id
          ) as Account | undefined;
          const Icon = getAccountIcon(account.type);

          return (
            <Card key={account.account_id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{account.name}</p>
                      {!account.is_active && <Badge variant="secondary">Hidden</Badge>}
                    </div>
                    <p className="text-xs capitalize text-muted-foreground">
                      {account.type.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {formatMoney(account.balance, account.currency)}
                  </p>
                  {fullAccount && <AccountActions account={fullAccount} />}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
