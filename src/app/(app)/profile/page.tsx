import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, HelpCircle, Settings, LogOut } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "";
  const initial = email.charAt(0).toUpperCase() || "?";
  const memberSince = user?.created_at
    ? new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
        new Date(user.created_at)
      )
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Profile</h1>

      <Card className="overflow-hidden border-none bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="flex items-center gap-4 py-5">
          <Avatar className="size-14 ring-2 ring-white/30">
            <AvatarFallback className="bg-white/15 text-xl font-semibold text-primary-foreground">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{email}</p>
            {memberSince && (
              <p className="text-sm text-primary-foreground/80">Member since {memberSince}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="divide-y py-0">
          <Link
            href="/settings"
            className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
          >
            <span className="flex items-center gap-2 text-sm">
              <Settings className="size-4 text-muted-foreground" />
              Settings
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          <Link
            href="/guide"
            className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
          >
            <span className="flex items-center gap-2 text-sm">
              <HelpCircle className="size-4 text-muted-foreground" />
              User guide
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      <form action={signOut}>
        <Button
          type="submit"
          variant="outline"
          className="w-full justify-center gap-2 text-destructive hover:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </form>

      <div className="flex flex-col items-center gap-2 pt-4 text-center">
        <Logo showWordmark={false} markClassName="size-10 rounded-xl" />
        <p className="text-xs text-muted-foreground">Sela — a product of Ratel Systems</p>
      </div>
    </div>
  );
}
