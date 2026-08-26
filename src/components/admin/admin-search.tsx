"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AdminSearch({ query }: { query?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateQuery(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-500" />
      <Input
        defaultValue={query ?? ""}
        placeholder="Search by email"
        className="border-neutral-700 bg-neutral-800 pl-8 text-white placeholder:text-neutral-500"
        onKeyDown={(e) => {
          if (e.key === "Enter") updateQuery(e.currentTarget.value);
        }}
        onBlur={(e) => updateQuery(e.currentTarget.value)}
      />
    </div>
  );
}
