import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { CommandSheet } from "@/components/nav/command-sheet";

export function TopBar({ email }: { email: string }) {
  const initial = email.charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <CommandSheet />
          <Link
            href="/search"
            aria-label="Search"
            className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="size-5" />
          </Link>
          <NotificationBell />
          <Link
            href="/profile"
            aria-label="Profile"
            className="flex size-11 items-center justify-center rounded-full transition-opacity hover:opacity-80"
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {initial}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
