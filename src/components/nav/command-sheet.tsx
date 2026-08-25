"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command as CommandIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  PieChart,
  Receipt,
  HandCoins,
  Repeat,
  PiggyBank,
  CalendarClock,
  Sparkles,
  BellRing,
  ClipboardList,
  BarChart3,
  HeartPulse,
  Users,
  Briefcase,
  Settings as SettingsIcon,
  Download,
  Search,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

type Action = {
  label: string;
  href: string;
  icon: LucideIcon;
  keywords?: string;
};

const ACTIONS: Action[] = [
  { label: "Add income", href: "/add/income", icon: ArrowDownCircle },
  { label: "Add expense", href: "/add/expense", icon: ArrowUpCircle },
  { label: "Transfer money", href: "/add/transfer", icon: ArrowLeftRight },
  { label: "New budget", href: "/budgets", icon: PieChart, keywords: "spending limit" },
  { label: "Add bill", href: "/expenses?tab=bills", icon: Receipt },
  { label: "Add loan", href: "/expenses?tab=loans", icon: HandCoins, keywords: "borrow lend" },
  { label: "New subscription", href: "/subscriptions", icon: Repeat, keywords: "recurring charge" },
  { label: "New savings goal", href: "/savings", icon: PiggyBank },
  { label: "New sinking fund", href: "/savings", icon: CalendarClock, keywords: "insurance christmas" },
  { label: "Add wishlist item", href: "/wishlist", icon: Sparkles, keywords: "afford want" },
  { label: "New reminder", href: "/reminders", icon: BellRing },
  { label: "View commitments", href: "/commitments", icon: ClipboardList, keywords: "bills owed" },
  { label: "View reports", href: "/reports", icon: BarChart3 },
  { label: "Financial health", href: "/financial-health", icon: HeartPulse },
  { label: "Manage clients", href: "/income?tab=clients", icon: Users },
  { label: "Manage projects", href: "/income?tab=projects", icon: Briefcase },
  { label: "Export data", href: "/settings", icon: Download, keywords: "csv download backup" },
  { label: "Search transactions", href: "/search", icon: Search },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

export function CommandSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACTIONS;
    return ACTIONS.filter(
      (a) => a.label.toLowerCase().includes(q) || a.keywords?.toLowerCase().includes(q)
    );
  }, [query]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        aria-label="Quick actions"
        onClick={() => setOpen(true)}
        className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <CommandIcon className="size-5" />
      </button>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>What do you want to do?</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 px-4 pb-6">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type an action…"
          />
          <div className="space-y-1">
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No matching actions.</p>
            )}
            {filtered.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => go(action.href)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-medium hover:bg-muted/60"
              >
                <action.icon className="size-4 text-muted-foreground" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
