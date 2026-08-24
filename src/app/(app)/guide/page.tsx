import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  PieChart,
  PiggyBank,
  BarChart3,
  Bell,
  Sparkles,
} from "lucide-react";

const sections = [
  {
    icon: ArrowDownCircle,
    title: "Logging income",
    body: (
      <>
        <p>
          Tap the blue <strong>+</strong> button on any screen, then choose{" "}
          <strong>Income</strong>. Pick which account received the money, and optionally
          tag it to a client/source or a project.
        </p>
        <p>
          Selling a product? Toggle <strong>Product sale</strong> to enter quantity, selling
          price, and cost price — Sela works out your profit automatically.
        </p>
      </>
    ),
  },
  {
    icon: ArrowUpCircle,
    title: "Logging expenses",
    body: (
      <>
        <p>
          Tap <strong>+</strong> → <strong>Expense</strong>. Pick a category and the account
          it came out of. Tap <strong>More details</strong> to add a payee, note, or flag it
          as a <strong>gift</strong> (gifts are tracked separately from normal spending).
        </p>
      </>
    ),
  },
  {
    icon: Wallet,
    title: "Accounts & transfers",
    body: (
      <>
        <p>
          Add every wallet you use — MoMo lines, bank accounts, cash — under{" "}
          <strong>Accounts</strong>. Each shows a live balance based on everything logged
          against it.
        </p>
        <p>
          Moving money between your own accounts (or withdrawing to cash)? Use{" "}
          <strong>Transfer</strong> — it never counts as income or expense.
        </p>
      </>
    ),
  },
  {
    icon: PieChart,
    title: "Budgets",
    body: (
      <p>
        Set a monthly spending limit per category under <strong>Budgets</strong>. The
        progress bar turns red once you go over, so you can catch overspending before it
        gets out of hand.
      </p>
    ),
  },
  {
    icon: PiggyBank,
    title: "Savings & tax",
    body: (
      <>
        <p>
          Create a rule like &quot;set aside 10% of all income for tax&quot; — Sela
          calculates the amount owed each month. One tap logs it as an actual transfer into
          a dedicated account.
        </p>
        <p>
          Savings goals track progress toward a target — a fixed monthly amount, or a
          percentage of your income.
        </p>
      </>
    ),
  },
  {
    icon: BarChart3,
    title: "Reports",
    body: (
      <p>
        See your daily income/expense trend, a breakdown of spending by category, and
        income by client — one month at a time.
      </p>
    ),
  },
  {
    icon: Bell,
    title: "Notifications",
    body: (
      <>
        <p>
          Turn on push notifications in <strong>Settings</strong> to get reminded about
          bills due soon, spending alerts you&apos;ve set up, and a weekly summary of your
          money in and out.
        </p>
        <p>
          On iPhone, install Sela to your Home Screen first (Share → Add to Home Screen) —
          iOS only allows notifications for installed apps.
        </p>
      </>
    ),
  },
  {
    icon: Sparkles,
    title: "Tips for staying on top of your money",
    body: (
      <ul className="list-disc space-y-1 pl-4">
        <li>Log expenses the moment you spend — it takes under 10 seconds.</li>
        <li>Set a budget for your 2–3 biggest spending categories first.</li>
        <li>
          Use one tax/savings rule from day one, even a small percentage — future you will
          thank you.
        </li>
        <li>Check Reports once a week to catch surprises early.</li>
      </ul>
    ),
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">User guide</h1>
        <p className="text-sm text-muted-foreground">Everything Sela can do for you.</p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardContent className="py-4">
              <details className="group" open={section === sections[0]}>
                <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <section.icon className="size-4 text-primary" />
                  </span>
                  <span className="flex-1 font-medium">{section.title}</span>
                  <span className="text-muted-foreground transition-transform group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <div className="mt-3 space-y-2 pl-12 text-sm text-muted-foreground [&_strong]:text-foreground [&_strong]:font-medium">
                  {section.body}
                </div>
              </details>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        Sela — a product of Ratel Systems
      </p>
    </div>
  );
}
