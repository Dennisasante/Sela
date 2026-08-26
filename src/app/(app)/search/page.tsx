import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSearchResults, TYPE_LABEL } from "@/lib/data/search";
import { formatMoney, formatDate } from "@/lib/format";
import { SearchInput } from "@/components/search/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { SearchX } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q ?? "";

  const supabase = await createClient();
  const results = query.trim().length >= 2 ? await getSearchResults(supabase, query) : [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Search</h1>
      <SearchInput initialQuery={query} />

      {query.trim().length >= 2 && results.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted">
            <SearchX className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No results for &quot;{query}&quot;</p>
          <p className="text-xs text-muted-foreground">
            Try a client name, account, category, or part of a description.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <Link key={`${r.type}-${r.id}`} href={r.href} className="block">
              <Card>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {TYPE_LABEL[r.type]}
                      {r.subtitle && ` · ${/^\d{4}-\d{2}-\d{2}$/.test(r.subtitle) ? formatDate(r.subtitle) : r.subtitle}`}
                    </p>
                  </div>
                  {r.amount !== null && (
                    <span className="text-sm font-medium">
                      {formatMoney(r.amount, r.currency ?? "GHS")}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
