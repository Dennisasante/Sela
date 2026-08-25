import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 py-6 text-center", className)}>
      {Icon && (
        <div className="flex size-11 items-center justify-center rounded-full bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      )}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="max-w-[26rem] text-xs text-muted-foreground">{description}</p>
      )}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className={cn(buttonVariants({ size: "sm" }), "mt-1")}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
