const KNOWN_PATTERNS: { test: RegExp; message: string }[] = [
  {
    test: /duplicate key value violates unique constraint/i,
    message: "That already exists — try a different name.",
  },
  {
    test: /violates foreign key constraint/i,
    message: "That item is linked to other records, so it can't be changed right now.",
  },
  {
    test: /violates row-level security policy|permission denied/i,
    message: "You don't have permission to do that.",
  },
  {
    test: /violates check constraint|invalid input syntax/i,
    message: "That value isn't valid — double-check the fields and try again.",
  },
  {
    test: /failed to fetch|networkerror|load failed|network request failed/i,
    message: "We couldn't reach the server. Check your connection and try again.",
  },
  {
    test: /jwt|token is expired|invalid token|not authenticated/i,
    message: "Your session expired — please sign in again.",
  },
];

// Matches the shape of a raw Postgres/PostgREST driver error that slipped through
// unmapped above, so it never gets shown to the user verbatim.
const RAW_DRIVER_ERROR = /^(new row|relation|column|null value|operator does not exist)/i;

export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!(err instanceof Error) || !err.message) return fallback;

  for (const { test, message } of KNOWN_PATTERNS) {
    if (test.test(err.message)) return message;
  }

  if (RAW_DRIVER_ERROR.test(err.message)) return fallback;

  return err.message;
}
