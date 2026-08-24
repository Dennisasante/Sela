import { Smartphone, Landmark, Banknote, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import type { AccountType } from "@/lib/supabase/types";

const ICONS: Record<AccountType, LucideIcon> = {
  mobile_money: Smartphone,
  bank: Landmark,
  cash: Banknote,
  investment: TrendingUp,
  other: Wallet,
};

export function getAccountIcon(type: AccountType): LucideIcon {
  return ICONS[type] ?? Wallet;
}
