"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("pwa_dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setShow(false);
  };

  const dismiss = () => {
    sessionStorage.setItem("pwa_dismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-xs p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/20">
          <Download className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--color-text)]">Install AI Empire</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">Add to your home screen for instant access</p>
          <div className="flex items-center gap-2 mt-3">
            <button onClick={install} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition">
              Install App
            </button>
            <button onClick={dismiss} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition">
              Not now
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="p-1 rounded hover:bg-white/10 text-gray-500">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
