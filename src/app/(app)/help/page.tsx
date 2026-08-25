import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ChevronRight, BookOpen } from "lucide-react";

const FAQ = [
  {
    q: "What's the difference between income I've received and income I'm expecting?",
    a: "Received income is money that has actually landed in one of your accounts — it's counted in your balance right away. Expected income (recurring pay, or a client's outstanding project balance) is shown separately in Plan/Income so you can see it coming, without it inflating your real balance until you confirm it's actually been paid.",
  },
  {
    q: "Why doesn't a transfer between my own accounts show up as income or an expense?",
    a: "Moving money from your Mobile Money wallet to your bank account doesn't change how much you actually have — it just moves where it sits. Sela keeps transfers separate from income/expenses so your spending and earning totals stay accurate.",
  },
  {
    q: "How is \"Safe to spend\" calculated?",
    a: "Safe to spend = your available balance, minus any bills you still owe, minus money you've committed to savings or tithe rules, minus your minimum reserve (if you've set one in Settings → Financial safety). You can see the exact breakdown on the dashboard.",
  },
  {
    q: "If I borrow money, does it count as income?",
    a: "No. A loan you receive increases your account balance but is tracked as a liability, not income — Sela never lets a loan inflate your income totals. The same applies in reverse when you lend money to someone else.",
  },
  {
    q: "What happens when I mark a bill or subscription as paid?",
    a: "Sela records the actual expense, deducts it from the account you chose, and — if it's recurring — rolls the due date forward to the next cycle automatically.",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Help &amp; support</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Frequently asked questions</h2>
        <div className="space-y-2">
          {FAQ.map((item) => (
            <Card key={item.q}>
              <CardContent className="py-3">
                <details>
                  <summary className="cursor-pointer select-none text-sm font-medium">
                    {item.q}
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Learn more</h2>
        <Card>
          <CardContent className="py-0">
            <Link
              href="/guide"
              className="flex items-center justify-between py-3.5"
            >
              <span className="flex items-center gap-2 text-sm">
                <BookOpen className="size-4 text-muted-foreground" />
                Open the user guide
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col items-center gap-2 pt-4 text-center">
        <Logo showWordmark={false} markClassName="size-10 rounded-xl" />
        <p className="text-sm font-medium">Sela</p>
        <p className="text-xs text-muted-foreground">Your money, watched over.</p>
        <p className="text-xs text-muted-foreground">A product of Ratel Systems</p>
        <p className="text-xs text-muted-foreground">Version 0.1.0</p>
      </section>
    </div>
  );
}
