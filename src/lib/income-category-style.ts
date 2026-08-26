export const INCOME_CATEGORY_LABEL: Record<string, string> = {
  stable: "Stable",
  gig: "Gig",
  product: "Product",
};

// Real distinct hues (not just the app's badge variants, which are all the
// same blue-ish hue at different lightness) — this is what actually reads
// as "color coding" rather than three shades of the same color.
export const INCOME_CATEGORY_COLOR: Record<string, string> = {
  stable: "#3b82f6",
  gig: "#f59e0b",
  product: "#22c55e",
};

const DEFAULT_COLOR = "#64748b";

export function getIncomeCategoryColor(category: string | null | undefined) {
  return INCOME_CATEGORY_COLOR[category ?? ""] ?? DEFAULT_COLOR;
}

export function getIncomeCategoryLabel(category: string | null | undefined) {
  return INCOME_CATEGORY_LABEL[category ?? ""] ?? (category || "Other");
}
