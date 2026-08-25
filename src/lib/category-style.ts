import {
  Car,
  GraduationCap,
  UtensilsCrossed,
  Zap,
  Smartphone,
  Home,
  PartyPopper,
  Gift,
  Wallet,
  ShoppingCart,
  HeartPulse,
  Plane,
  Gamepad2,
  Shirt,
  Wifi,
  Dog,
  Baby,
  Wrench,
  Coffee,
  Film,
  Dumbbell,
  Shapes,
  type LucideIcon,
} from "lucide-react";

type CategoryStyle = {
  icon: LucideIcon;
  bg: string;
  fg: string;
};

const STYLES: Record<string, CategoryStyle> = {
  transport: { icon: Car, bg: "bg-primary/10", fg: "text-primary" },
  "printing/school": { icon: GraduationCap, bg: "bg-accent", fg: "text-accent-foreground" },
  food: { icon: UtensilsCrossed, bg: "bg-destructive/10", fg: "text-destructive" },
  utilities: { icon: Zap, bg: "bg-primary/10", fg: "text-primary" },
  "airtime/data": { icon: Smartphone, bg: "bg-accent", fg: "text-accent-foreground" },
  rent: { icon: Home, bg: "bg-primary/10", fg: "text-primary" },
  entertainment: { icon: PartyPopper, bg: "bg-destructive/10", fg: "text-destructive" },
  gifts: { icon: Gift, bg: "bg-accent", fg: "text-accent-foreground" },
};

const DEFAULT_STYLE: CategoryStyle = {
  icon: Wallet,
  bg: "bg-muted",
  fg: "text-muted-foreground",
};

export function getCategoryStyle(name: string): CategoryStyle {
  return STYLES[name.toLowerCase()] ?? DEFAULT_STYLE;
}

// User-customizable icon/color picker for the category manager (Settings), stored
// per-category in expense_categories.icon/color — independent of the name-keyed
// STYLES map above, which only covers the seeded default categories.
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  cart: ShoppingCart,
  food: UtensilsCrossed,
  transport: Car,
  home: Home,
  utilities: Zap,
  health: HeartPulse,
  education: GraduationCap,
  travel: Plane,
  gift: Gift,
  entertainment: Gamepad2,
  clothing: Shirt,
  internet: Wifi,
  pets: Dog,
  family: Baby,
  repairs: Wrench,
  coffee: Coffee,
  movies: Film,
  fitness: Dumbbell,
  shapes: Shapes,
};

export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICONS);

export const CATEGORY_COLOR_OPTIONS = [
  "#64748b",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
];

export function getCategoryIcon(icon: string | null | undefined): LucideIcon {
  return CATEGORY_ICONS[icon ?? ""] ?? Shapes;
}
