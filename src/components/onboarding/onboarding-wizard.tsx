"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import {
  saveOnboardingProfile,
  createFirstAccount,
  createFirstGoal,
  completeOnboarding,
} from "@/app/onboarding/actions";
import { PushSubscribeToggle } from "@/components/notifications/push-subscribe-toggle";
import { InstallPrompt } from "@/components/settings/install-prompt";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, Landmark, ShoppingBag, Layers } from "lucide-react";

const INCOME_TYPES = [
  { value: "stable", label: "Stable salary", icon: Landmark },
  { value: "gig", label: "Gig / freelance", icon: Briefcase },
  { value: "product", label: "Selling products", icon: ShoppingBag },
  { value: "mixed", label: "A mix of these", icon: Layers },
];

const ACCOUNT_TYPES = [
  { value: "mobile_money", label: "Mobile money" },
  { value: "bank", label: "Bank account" },
  { value: "cash", label: "Cash" },
  { value: "investment", label: "Investment" },
  { value: "other", label: "Other" },
];

const TOTAL_STEPS = 5;

export function OnboardingWizard({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(defaultName);
  const [incomeType, setIncomeType] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("mobile_money");
  const [openingBalance, setOpeningBalance] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleProfileNext() {
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("full_name", name);
        fd.set("income_type", incomeType);
        await saveOnboardingProfile(fd);
        next();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleAccountNext() {
    startTransition(async () => {
      try {
        if (accountName.trim()) {
          const fd = new FormData();
          fd.set("name", accountName);
          fd.set("type", accountType);
          fd.set("opening_balance", openingBalance || "0");
          await createFirstAccount(fd);
        }
        next();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleGoalNext() {
    startTransition(async () => {
      try {
        if (goalName.trim() && goalTarget) {
          const fd = new FormData();
          fd.set("name", goalName);
          fd.set("target_amount", goalTarget);
          await createFirstGoal(fd);
        }
        next();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleFinish() {
    startTransition(async () => {
      try {
        await completeOnboarding();
        router.push("/");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <Logo showWordmark={false} markClassName="size-12 rounded-2xl" />
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-6 rounded-full",
                i <= step ? "bg-brand" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">Welcome to Sela</h1>
            <p className="text-sm text-muted-foreground">
              Let&apos;s set a few things up — it takes under a minute.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="onboard_name">What should we call you?</Label>
            <Input
              id="onboard_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
            />
          </div>
          <Button className="w-full" disabled={pending || !name.trim()} onClick={handleProfileNext}>
            {pending ? "Saving…" : "Continue"}
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">How does most of your money come in?</h1>
            <p className="text-sm text-muted-foreground">
              This just helps Sela tailor a few defaults — you can mix and match later.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {INCOME_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setIncomeType(t.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-4 text-center text-sm",
                  incomeType === t.value ? "border-brand bg-brand/5" : "border-border"
                )}
              >
                <t.icon className="size-5" />
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={back}>
              Back
            </Button>
            <Button
              className="flex-1"
              disabled={pending || !incomeType}
              onClick={handleProfileNext}
            >
              {pending ? "Saving…" : "Continue"}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">Add your first account</h1>
            <p className="text-sm text-muted-foreground">
              Mobile money, bank, or cash — wherever most of your money sits. You can skip
              this and add it later.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_name">Account name</Label>
            <Input
              id="account_name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. MTN MoMo, GTBank"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="account_type">Type</Label>
              <Select value={accountType} onValueChange={(v) => setAccountType(v ?? "cash")}>
                <SelectTrigger id="account_type" className="w-full">
                  <SelectValue>
                    {(v: string) => ACCOUNT_TYPES.find((a) => a.value === v)?.label ?? "Type"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="opening_balance">Current balance</Label>
              <Input
                id="opening_balance"
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={back}>
              Back
            </Button>
            <Button className="flex-1" disabled={pending} onClick={handleAccountNext}>
              {pending ? "Saving…" : accountName.trim() ? "Continue" : "Skip for now"}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">Set a first goal</h1>
            <p className="text-sm text-muted-foreground">
              Something you&apos;re saving toward — optional, you can add this anytime from
              Goals &amp; Savings.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal_name">Goal</Label>
            <Input
              id="goal_name"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="e.g. Emergency fund"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal_target">Target amount</Label>
            <Input
              id="goal_target"
              type="number"
              step="0.01"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={back}>
              Back
            </Button>
            <Button className="flex-1" disabled={pending} onClick={handleGoalNext}>
              {pending ? "Saving…" : goalName.trim() ? "Continue" : "Skip for now"}
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">Stay in the loop</h1>
            <p className="text-sm text-muted-foreground">
              Turn on notifications for bills and reports, and install Sela for one-tap
              access.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <PushSubscribeToggle />
          </div>
          <div className="rounded-lg border p-4">
            <InstallPrompt />
          </div>
          <Button className="w-full" disabled={pending} onClick={handleFinish}>
            {pending ? "Finishing…" : "Go to dashboard"}
          </Button>
        </div>
      )}
    </div>
  );
}
