import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  PieChart,
  PiggyBank,
  Repeat,
  BarChart3,
  HeartPulse,
  CalendarDays,
  Search,
  Bell,
  Download,
  ShieldCheck,
  UserCog,
  Lightbulb,
  ClipboardList,
  BellRing,
} from "lucide-react";

const sections = [
  {
    icon: Sparkles,
    title: "Getting started",
    body: (
      <>
        <p>
          Add your first wallet under <strong>Accounts</strong> — mobile money, bank, or
          cash — with its current balance. Every screen after that is built around the
          blue <strong>+</strong> button: tap it any time you need to record money moving.
        </p>
        <p>
          The bottom bar is <strong>Home, Income, Budgets, +, Expenses, Accounts</strong>,
          and everything else — clients, projects, subscriptions, reports, financial
          health, the calendar, search, notifications, profile, settings — lives under{" "}
          <strong>Menu</strong>.
        </p>
      </>
    ),
  },
  {
    icon: ArrowDownCircle,
    title: "Income, expected income & recurring income",
    body: (
      <>
        <p>
          Tap <strong>+</strong> → <strong>Income</strong> to log money you&apos;ve actually
          received. Tag it to a client/source and, if it&apos;s project work, the project
          itself.
        </p>
        <p>
          The Income page has an <strong>Expected</strong> tab for money you know is
          coming but hasn&apos;t arrived yet — a recurring salary, an invoice you&apos;ve
          sent. Expected amounts never touch your account balance until you tap{" "}
          <strong>Record as received</strong>, so your numbers never confuse &quot;money
          I have&quot; with &quot;money I&apos;m owed.&quot;
        </p>
        <p>
          Selling a product? Toggle <strong>Product sale</strong> in the Income form to
          enter quantity, selling price, cost price, and delivery — Sela works out your
          profit and margin automatically.
        </p>
      </>
    ),
  },
  {
    icon: Users,
    title: "Clients & projects",
    body: (
      <>
        <p>
          Under <strong>Menu → Clients</strong>, add everyone who pays you, with their
          total billed, received, and outstanding balance at a glance.
        </p>
        <p>
          Under <strong>Menu → Projects</strong>, break a client&apos;s work into a payment
          schedule — deposit, milestone, final — and mark each milestone paid as the money
          comes in. Tag expenses to a project from the Expense form to see its true net
          profit (received minus project expenses).
        </p>
      </>
    ),
  },
  {
    icon: ArrowUpCircle,
    title: "Expenses, bills & loans",
    body: (
      <>
        <p>
          Tap <strong>+</strong> → <strong>Expense</strong> for anything you&apos;ve
          already paid. Add a payee or note, flag it as a <strong>gift</strong> (tracked
          separately from normal spending), or tag it to a project or budget category.
        </p>
        <p>
          The Expenses page&apos;s <strong>Bills</strong> tab is for money you owe but
          haven&apos;t paid yet — a bill due next week doesn&apos;t touch your balance
          until you tap <strong>Mark paid</strong>, and partial payments are tracked too.
        </p>
        <p>
          The <strong>Loans</strong> tab keeps borrowed and lent money separate from
          income and expenses entirely — a loan you receive increases your balance
          without inflating your income, and repayments reduce the outstanding balance
          without counting as ordinary spending.
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
          Every account&apos;s balance is calculated from its full transaction history —
          never a number you type in directly. Moving money between your own accounts
          (or withdrawing to cash)? Use <strong>Transfer</strong> — it never counts as
          income or expense, so it can&apos;t distort your monthly totals.
        </p>
      </>
    ),
  },
  {
    icon: PieChart,
    title: "Budgets",
    body: (
      <p>
        Set a monthly spending limit per category under <strong>Budgets</strong>. Each
        budget shows actual spend, remaining amount, and a projected month-end total
        based on your pace so far — the progress bar turns red once you&apos;re over.
        Tap a budget to see exactly which transactions make up the total.
      </p>
    ),
  },
  {
    icon: PiggyBank,
    title: "Goals, savings & tax rules",
    body: (
      <>
        <p>
          Create a <strong>set-aside rule</strong> — &quot;10% of all income for
          tax&quot; — and Sela calculates the amount owed each month, showing exactly
          which income entries were counted. One tap logs it as a real transfer into a
          dedicated account.
        </p>
        <p>
          <strong>Goals</strong> track progress toward a target with a priority and
          status (on track, behind, completed) — a fixed monthly amount or a percentage
          of your income.
        </p>
        <p>
          <strong>Sinking funds</strong>, right below Goals on the same page, are for a
          known future expense rather than an open-ended target — insurance renewal,
          Christmas, school fees. Mark one as recurring and after you tap{" "}
          <strong>Mark paid &amp; restart</strong>, it resets for the next cycle instead
          of you having to recreate it.
        </p>
      </>
    ),
  },
  {
    icon: Repeat,
    title: "Subscriptions",
    body: (
      <p>
        Track recurring charges — hosting, streaming, software — under{" "}
        <strong>Menu → Subscriptions</strong>, with billing frequency and next charge
        date, so they show up in what&apos;s coming up rather than surprising you.
      </p>
    ),
  },
  {
    icon: BarChart3,
    title: "Reports & financial health",
    body: (
      <>
        <p>
          <strong>Reports</strong> shows your income/expense trend, spending by category,
          and income by client. Pick a range — today, this week, this month, last 90
          days, this year, or a custom span — the same picker used on Income and
          Expenses. It defaults to the last 7 days, matching the weekly report push
          notification.
        </p>
        <p>
          <strong>Financial health</strong> scores real factors from your own data —
          savings rate, budget adherence, upcoming commitments — never a made-up number,
          and always explains how each factor was calculated.
        </p>
      </>
    ),
  },
  {
    icon: ClipboardList,
    title: "Commitments",
    body: (
      <p>
        <strong>Menu → Commitments</strong> totals everything you&apos;re on the hook for
        in one place — bills owed, subscription cost, loans you owe, savings rules, and
        sinking funds — with a single &quot;this month&apos;s commitments&quot; figure at
        the top. Tap any row to jump to that section.
      </p>
    ),
  },
  {
    icon: Sparkles,
    title: "Wishlist",
    body: (
      <p>
        Add anything you want under <strong>Menu → Wishlist</strong> with an estimated
        price. Each item shows whether you can afford it right now, based on your actual
        safe-to-spend figure — balance minus committed bills, planned savings, and your
        minimum reserve — not just your raw balance.
      </p>
    ),
  },
  {
    icon: BellRing,
    title: "Reminders",
    body: (
      <p>
        <strong>Menu → Reminders</strong> is for anything you don&apos;t want to forget
        that isn&apos;t tied to a bill or income — a renewal, a follow-up, a deadline. Set
        a date, time, and repeat (daily, weekly, monthly, yearly), and Sela notifies you.
      </p>
    ),
  },
  {
    icon: CalendarDays,
    title: "Financial calendar",
    body: (
      <p>
        See expected income, bills, and project milestones laid out by date under{" "}
        <strong>Menu → Financial calendar</strong>. Tap any day to see exactly what&apos;s
        happening on it.
      </p>
    ),
  },
  {
    icon: Search,
    title: "Search & quick actions",
    body: (
      <>
        <p>
          The search icon in the top bar finds a transaction, client, or category by
          name or amount without digging through tabs.
        </p>
        <p>
          The <strong>command</strong> icon next to it opens a searchable list of
          shortcuts — &quot;add expense&quot;, &quot;new reminder&quot;, &quot;export
          data&quot; — for jumping straight to an action instead of navigating there.
        </p>
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "The Guardian card",
    body: (
      <p>
        The card near the top of Home is Sela&apos;s guardian insight — a single,
        real-data observation picked from what matters most right now: a budget close to
        its limit, money expected this month, or confirmation that your current balance
        covers everything you&apos;ve committed to. It only ever reports what&apos;s
        actually true of your numbers, and the tone is always supportive, never a scold.
      </p>
    ),
  },
  {
    icon: Bell,
    title: "Notifications & installing Sela",
    body: (
      <>
        <p>
          Turn on push notifications under <strong>Settings</strong> for bills due soon,
          budget alerts, and a weekly summary. On iPhone, Safari only allows
          notifications for apps installed to the Home Screen — Sela will tell you to do
          that first if needed.
        </p>
        <p>
          <strong>Settings → Install Sela</strong> gives you a one-tap install on Android
          Chrome, or the exact Share → Add to Home Screen steps on iOS.
        </p>
        <p>
          <strong>Settings → Appearance</strong> switches between light, dark, and
          system — the brand colors stay the same either way.
        </p>
      </>
    ),
  },
  {
    icon: UserCog,
    title: "Profile & security",
    body: (
      <>
        <p>
          Edit your display name from the <strong>Profile</strong> page — it&apos;s what
          shows in the dashboard greeting. Change your password or email, and see whether
          your email is verified, under <strong>Settings → Security</strong>. Changing
          your email sends a confirmation link to the new address first.
        </p>
        <p>
          Signing in with Google is supported wherever your Supabase project has it
          turned on.
        </p>
        <p>
          <strong>Settings → Data export</strong> downloads your income, expenses, and
          transfers as a CSV file for a range you pick — handy for backups or your own
          spreadsheets.
        </p>
      </>
    ),
  },
  {
    icon: Lightbulb,
    title: "Tips for staying on top of your money",
    body: (
      <ul className="list-disc space-y-1 pl-4">
        <li>Log expenses the moment you spend — it takes under 10 seconds.</li>
        <li>Set a budget for your 2–3 biggest spending categories first.</li>
        <li>
          Use one tax/savings rule from day one, even a small percentage — future you
          will thank you.
        </li>
        <li>
          Record income as <strong>Expected</strong> the moment you agree to it, so you
          always know what&apos;s coming without touching your actual balance early.
        </li>
        <li>Check the Guardian card and Financial health once a week.</li>
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
