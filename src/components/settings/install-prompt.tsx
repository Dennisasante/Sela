"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { isIosSafariOutsidePwa, isStandalone } from "@/lib/pwa";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt({ appName = "Sela" }: { appName?: string }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosGuide, setIosGuide] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setIosGuide(isIosSafariOutsidePwa());

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setInstallEvent(null);
  }

  if (installed) {
    return <p className="text-sm text-muted-foreground">{appName} is installed on this device.</p>;
  }

  if (installEvent) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Add {appName} to your home screen for faster access and a better offline experience.
        </p>
        <Button onClick={handleInstall} size="sm" className="w-full">
          <Download className="size-4" />
          Install {appName}
        </Button>
      </div>
    );
  }

  if (iosGuide) {
    return (
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Share className="mt-0.5 size-4 shrink-0" />
        <p>
          Tap the Share icon in Safari, then choose <strong>Add to Home Screen</strong> to install{" "}
          {appName}.
        </p>
      </div>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      Your browser doesn&apos;t currently offer an install prompt. Look for &quot;Install app&quot;
      or &quot;Add to Home Screen&quot; in your browser&apos;s menu.
    </p>
  );
}
