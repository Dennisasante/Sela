import { toast as sonnerToast } from "sonner";

// React's `startTransition` marks state updates from its callback as low-priority.
// Every mutation in this app follows the shape
//   startTransition(async () => { try { await action() } catch (err) { toast.error(...) } })
// and a toast fired synchronously inside that scope can get coalesced into the
// transition and silently dropped instead of painted. Deferring the call to a
// macrotask (setTimeout 0) escapes the transition so the toast reliably renders.
function defer(fn: () => void) {
  setTimeout(fn, 0);
}

export const toast = {
  success: (...args: Parameters<typeof sonnerToast.success>) =>
    defer(() => sonnerToast.success(...args)),
  error: (...args: Parameters<typeof sonnerToast.error>) =>
    defer(() => sonnerToast.error(...args)),
  info: (...args: Parameters<typeof sonnerToast.info>) =>
    defer(() => sonnerToast.info(...args)),
  warning: (...args: Parameters<typeof sonnerToast.warning>) =>
    defer(() => sonnerToast.warning(...args)),
  message: (...args: Parameters<typeof sonnerToast.message>) =>
    defer(() => sonnerToast.message(...args)),
  dismiss: (...args: Parameters<typeof sonnerToast.dismiss>) =>
    defer(() => sonnerToast.dismiss(...args)),
};
