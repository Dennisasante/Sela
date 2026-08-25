import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendPushToUser } from "@/lib/push";
import { formatMoney, toISODate } from "@/lib/format";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const end = toISODate(new Date());
  const start = toISODate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  const { data: subs } = await supabase.from("push_subscriptions").select("user_id");
  const userIds = [...new Set((subs ?? []).map((s) => s.user_id))];

  let sent = 0;
  for (const userId of userIds) {
    const [{ data: income }, { data: expenses }] = await Promise.all([
      supabase
        .from("income_entries")
        .select("amount, currency")
        .eq("user_id", userId)
        .gte("date", start)
        .lte("date", end),
      supabase
        .from("expenses")
        .select("amount, currency")
        .eq("user_id", userId)
        .gte("date", start)
        .lte("date", end),
    ]);

    const totalIncome = (income ?? []).reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = (expenses ?? []).reduce((sum, r) => sum + r.amount, 0);
    const currency = income?.[0]?.currency ?? expenses?.[0]?.currency ?? "GHS";
    const net = totalIncome - totalExpense;

    await sendPushToUser(supabase, userId, {
      title: "Your weekly Sela report",
      body: `Income ${formatMoney(totalIncome, currency)} · Expenses ${formatMoney(totalExpense, currency)} · Net ${formatMoney(net, currency)}`,
      url: "/reports?range=last_7",
    });
    sent += 1;
  }

  return NextResponse.json({ ok: true, usersNotified: sent });
}
