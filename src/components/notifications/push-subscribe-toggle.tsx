"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { Bell, BellOff } from "lucide-react";
import { savePushSubscription, deletePushSubscription } from "@/app/(app)/settings/push-actions";
import { isIosSafariOutsidePwa } from "@/lib/pwa";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Status =
  | { kind: "loading" }
  | { kind: "unsupported" }
  | { kind: "ios-needs-install" }
  | { kind: "ready"; subscribed: boolean };

export function PushSubscribeToggle() {
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let next: Status;
      // iOS Safari doesn't expose PushManager at all until the site is
      // installed to the home screen — check this before the generic
      // capability check, or installable iOS users see "unsupported"
      // instead of the accurate "install first" guidance.
      if (isIosSafariOutsidePwa()) {
        next = { kind: "ios-needs-install" };
      } else if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        next = { kind: "unsupported" };
      } else {
        try {
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 5000)
          );
          const reg = await Promise.race([navigator.serviceWorker.ready, timeout]);
          const sub = await reg.pushManager.getSubscription();
          next = { kind: "ready", subscribed: !!sub };
        } catch {
          next = { kind: "unsupported" };
        }
      }
      if (!cancelled) setStatus(next);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;

        if (checked) {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            toast.error("Notification permission was denied");
            return;
          }

          const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!publicKey) {
            toast.error("Push isn't configured for this deployment yet");
            return;
          }

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });

          await savePushSubscription(subscription.toJSON() as {
            endpoint: string;
            keys: { p256dh: string; auth: string };
          });
          setStatus({ kind: "ready", subscribed: true });
          toast.success("Notifications enabled");
        } else {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await deletePushSubscription(subscription.endpoint);
            await subscription.unsubscribe();
          }
          setStatus({ kind: "ready", subscribed: false });
          toast.success("Notifications turned off");
        }
      } catch {
        toast.error("Couldn't update notification settings");
      }
    });
  }

  if (status.kind === "loading") return null;

  if (status.kind === "unsupported" || status.kind === "ios-needs-install") {
    return (
      <div className="flex items-start gap-3">
        <BellOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {status.kind === "ios-needs-install"
            ? "Add Sela to your Home Screen first (Share → Add to Home Screen), then come back here to enable notifications."
            : "Push notifications aren't supported in this browser."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bell className="size-4 text-muted-foreground" />
        <Label htmlFor="push-toggle" className="font-normal">
          Push notifications
        </Label>
      </div>
      <Switch
        id="push-toggle"
        checked={status.subscribed}
        disabled={pending}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}
