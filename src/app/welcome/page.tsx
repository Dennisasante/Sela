import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  PieChart,
  PiggyBank,
  Bell,
  Sparkles,
  BarChart3,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "The Guardian card",
    description: "A real-data insight on your home screen — never a made-up number.",
  },
  {
    icon: PieChart,
    title: "Income, expenses & budgets",
    description: "Track every cedi, set monthly limits, and see exactly where it went.",
  },
  {
    icon: PiggyBank,
    title: "Goals & sinking funds",
    description: "Save toward what matters — a target, a trip, or next year's insurance.",
  },
  {
    icon: BarChart3,
    title: "Reports & financial health",
    description: "Understand your trends and get a real score for your money habits.",
  },
  {
    icon: Bell,
    title: "Bills, reminders & alerts",
    description: "Nothing sneaks up on you — bills, subscriptions, and custom reminders.",
  },
  {
    icon: Sparkles,
    title: "Wishlist with affordability",
    description: "See instantly whether you can actually afford what you want.",
  },
];

export default function WelcomePage() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-brand/5 to-background">
      <div className="mx-auto flex max-w-md flex-col gap-10 px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo showWordmark={false} markClassName="size-16 rounded-2xl shadow-lg shadow-brand/25" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Sela</h1>
            <p className="mt-1 text-muted-foreground">Your money, watched over.</p>
          </div>
          <p className="text-sm text-muted-foreground">
            A personal finance tracker built for real life — income, expenses, bills,
            goals, and a guardian that watches your numbers so you don&apos;t have to.
          </p>
          <div className="flex w-full flex-col gap-2 pt-2">
            <Button size="lg" className="w-full" render={<Link href="/signup" />}>
              Get started
            </Button>
            <Button size="lg" variant="outline" className="w-full" render={<Link href="/login" />}>
              Log in
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex items-start gap-3 py-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10">
                  <feature.icon className="size-4 text-brand" />
                </span>
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          A product of Ratel Systems
        </p>
      </div>
    </div>
  );
}
