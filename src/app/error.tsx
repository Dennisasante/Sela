"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertOctagon } from "lucide-react";

export default function RootError({
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
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertOctagon className="size-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load Sela. Check your connection and try again.
            </p>
          </div>
          <Button onClick={reset} className="mt-2 w-full">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
