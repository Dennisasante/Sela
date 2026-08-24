import { cloneElement, type ReactElement } from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Base UI's `render` prop merges the target element's own props with the
 * wrapping primitive's, and which `data-slot` wins isn't stable between SSR
 * and hydration when both sides set it (e.g. Button sets "button", Trigger
 * wants "dialog-trigger") — causing a hydration mismatch warning. Stamping
 * the slot explicitly before handing the element to `render` makes it
 * deterministic.
 */
export function withDataSlot(element: ReactElement, slot: string): ReactElement {
  return cloneElement(element, { "data-slot": slot } as Record<string, unknown>)
}
