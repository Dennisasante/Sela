"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100dvh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1.5rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <p style={{ fontWeight: 600 }}>Something went wrong</p>
          <p style={{ fontSize: "0.875rem", color: "#666" }}>
            We couldn&apos;t load Sela. Check your connection and try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#004aad",
              color: "white",
              fontWeight: 500,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
