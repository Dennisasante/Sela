import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight } from "lucide-react";

const options = [
  {
    href: "/add/income",
    label: "Income",
    description: "Log a payment received",
    icon: ArrowDownCircle,
    color: "text-success",
  },
  {
    href: "/add/expense",
    label: "Expense",
    description: "Log money spent",
    icon: ArrowUpCircle,
    color: "text-destructive",
  },
  {
    href: "/add/transfer",
    label: "Transfer",
    description: "Move money between your accounts",
    icon: ArrowLeftRight,
    color: "text-info",
  },
];

export default function AddPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Add</h1>
      <div className="space-y-3">
        {options.map((option) => (
          <Link key={option.href} href={option.href} className="block">
            <Card className="flex-row items-center gap-4 p-4">
              <option.icon className={`size-8 ${option.color}`} />
              <div>
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
