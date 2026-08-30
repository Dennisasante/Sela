import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Note: we used to run every `render={trigger}` element through a
// `withDataSlot` helper (`cloneElement(trigger, { "data-slot": slot })`)
// before handing it to Base UI's `render` prop, to keep the data-slot
// attribute deterministic across SSR/hydration. That `cloneElement` call
// turned out to intermittently strip the element's `type` for elements
// created in a Server Component and threaded down as a prop (React error
// #130, "Element type is invalid... but got: undefined") for some
// accounts' data shapes — a real crash, not just a hydration warning.
// Passing the trigger element straight through fixes the crash; the
// downside is `data-slot` may occasionally disagree between the trigger's
// own value and the wrapping primitive's during hydration, which is a
// harmless console warning, not a functional bug.
