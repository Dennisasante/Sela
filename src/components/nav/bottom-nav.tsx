"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  PieChart,
  Plus,
  Menu as MenuIcon,
  Users,
  Briefcase,
  Repeat,
  PiggyBank,
  BarChart3,
  HeartPulse,
  CalendarDays,
  User,
  Settings as SettingsIcon,
  Bell,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const leftItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: ArrowDownCircle },
  { href: "/budgets", label: "Budgets", icon: PieChart },
];

const rightItems = [
  { href: "/expenses", label: "Expenses", icon: ArrowUpCircle },
  { href: "/accounts", label: "Accounts", icon: Wallet },
];

const menuGroups = [
  {
    label: "Manage",
    items: [
      { href: "/income?tab=clients", label: "Clients", icon: Users },
      { href: "/income?tab=projects", label: "Projects", icon: Briefcase },
      { href: "/subscriptions", label: "Subscriptions", icon: Repeat },
      { href: "/savings", label: "Goals & Savings", icon: PiggyBank },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/financial-health", label: "Financial health", icon: HeartPulse },
      { href: "/calendar", label: "Financial calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Personal",
    items: [
      { href: "/profile", label: "Profile", icon: User },
      { href: "/settings", label: "Settings", icon: SettingsIcon },
      { href: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Help",
    items: [
      { href: "/guide", label: "User guide", icon: BookOpen },
      { href: "/help", label: "Help & support", icon: HelpCircle },
    ],
  },
];

const moreItems = menuGroups.flatMap((g) => g.items);

function hrefPath(href: string) {
  return href.split("?")[0];
}

export function BottomNav() {
  const pathname = usePathname();
  const moreActive = moreItems.some((item) => hrefPath(item.href) === pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="relative mx-auto flex max-w-2xl items-stretch justify-between gap-1 px-1">
        {leftItems.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        <div className="relative flex w-16 shrink-0 items-center justify-center">
          <Link
            href="/add"
            aria-label="Add"
            className="absolute -top-6 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand/80 text-brand-foreground shadow-lg shadow-brand/40 ring-4 ring-background transition-transform active:scale-95"
          >
            <Plus className="size-6" />
          </Link>
        </div>

        {rightItems.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <button
                className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2"
                aria-label="Menu"
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full transition-colors",
                    moreActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <MenuIcon className="size-5" />
                </span>
                <span
                  className={cn(
                    "max-w-full truncate text-[10px] leading-none",
                    moreActive ? "font-medium text-primary" : "text-muted-foreground"
                  )}
                >
                  Menu
                </span>
              </button>
            }
          />
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-4 pb-6">
              {menuGroups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <p className="px-3 text-xs font-medium text-muted-foreground">{group.label}</p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = hrefPath(item.href) === pathname;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium",
                          active ? "bg-primary/10 text-primary" : "hover:bg-muted/60"
                        )}
                      >
                        <Icon className="size-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

function NavLink({
  item,
  active,
}: {
  item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2"
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full transition-colors",
          active ? "bg-primary/10 text-primary" : "text-muted-foreground"
        )}
      >
        <Icon className="size-5" />
      </span>
      <span
        className={cn(
          "max-w-full truncate text-[10px] leading-none",
          active ? "font-medium text-primary" : "text-muted-foreground"
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}
