"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Command } from "lucide-react";

const SHORTCUTS = [
  { keys: ["⌘", "K"], desc: "Search tools", action: "search" },
  { keys: ["⌘", "/"], desc: "Show shortcuts", action: "help" },
  { keys: ["G", "D"], desc: "Go to Dashboard", action: "nav", path: "/dashboard" },
  { keys: ["G", "A"], desc: "Go to Analytics", action: "nav", path: "/dashboard/analytics" },
  { keys: ["G", "P"], desc: "Go to Profile", action: "nav", path: "/profile" },
  { keys: ["G", "R"], desc: "Go to Referrals", action: "nav", path: "/dashboard/referrals" },
  { keys: ["G", "S"], desc: "Go to Subscriptions", action: "nav", path: "/dashboard/subscriptions" },
];

export default function KeyboardShortcuts() {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const [lastKey, setLastKey] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShow((s) => !s);
        return;
      }

      // Two-key combos: g+key
      if (lastKey === "g") {
        const combo = SHORTCUTS.find((s) => s.keys[0] === "G" && s.keys[1] === e.key.toUpperCase() && s.path);
        if (combo?.path) {
          e.preventDefault();
          router.push(combo.path);
        }
        setLastKey("");
        return;
      }

      if (e.key === "g") {
        setLastKey("g");
        setTimeout(() => setLastKey(""), 1000);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lastKey, router]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShow(false)}>
      <div className="w-full max-w-md mx-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-[var(--color-text)]">Keyboard Shortcuts</h3>
          </div>
          <button onClick={() => setShow(false)} className="p-1 rounded-lg hover:bg-white/10 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5">
              <span className="text-sm text-[var(--color-text-secondary)]">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <span key={j}>
                    <kbd className="px-2 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text)]">{k}</kbd>
                    {j < s.keys.length - 1 && <span className="text-gray-500 mx-0.5">+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
