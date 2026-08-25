"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { AlertOctagon } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertOctagon className="size-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">We couldn&apos;t load this page</p>
            <p className="text-sm text-muted-foreground">
              Something went wrong on our end. Check your connection and try again.
            </p>
          </div>
          <div className="mt-2 flex w-full flex-col gap-2">
            <Button onClick={reset} className="w-full">
              Try again
            </Button>
            <Link href="/" className={buttonVariants({ variant: "outline", className: "w-full" })}>
              Go to dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
