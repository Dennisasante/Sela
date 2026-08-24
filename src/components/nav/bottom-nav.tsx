"use client";

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
  Menu,
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

const moreItems = [
  { href: "/savings", label: "Savings & Tax" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
  { href: "/profile", label: "Profile" },
  { href: "/guide", label: "User guide" },
];

export function BottomNav() {
  const pathname = usePathname();
  const moreActive = moreItems.some((item) => pathname === item.href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border/70 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="relative mx-auto flex max-w-2xl items-stretch justify-between px-1">
        {leftItems.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        <div className="relative flex w-16 shrink-0 items-center justify-center">
          <Link
            href="/add"
            aria-label="Add"
            className="absolute -top-6 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-background transition-transform active:scale-95"
          >
            <Plus className="size-6" />
          </Link>
        </div>

        {rightItems.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        <Sheet>
          <SheetTrigger
            render={
              <button
                className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
                aria-label="More"
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full transition-colors",
                    moreActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <Menu className="size-5" />
                </span>
                <span
                  className={cn(
                    "text-[11px] leading-none",
                    moreActive ? "font-medium text-primary" : "text-muted-foreground"
                  )}
                >
                  More
                </span>
              </button>
            }
          />
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>More</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4 pb-6">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-3 text-sm font-medium",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/60"
                  )}
                >
                  {item.label}
                </Link>
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
      className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
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
          "text-[11px] leading-none",
          active ? "font-medium text-primary" : "text-muted-foreground"
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}
