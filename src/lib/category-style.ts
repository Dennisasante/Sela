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
