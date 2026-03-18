"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, Coins } from "lucide-react";
import Link from "next/link";

export default function TokenWarning() {
  const [balance, setBalance] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/tokens/balance")
      .then((r) => r.json())
      .then((d) => setBalance(d.tokens ?? d.balance ?? null))
      .catch(() => {});
  }, []);

  if (dismissed || balance === null || balance > 20) return null;

  const critical = balance <= 5;

  return (
    <div className={`fixed bottom-20 right-6 z-40 max-w-sm p-4 rounded-xl border shadow-lg ${
      critical
        ? "bg-red-500/10 border-red-500/30 text-red-300"
        : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
    }`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {critical ? "Almost out of tokens!" : "Low token balance"}
          </p>
          <p className="text-xs mt-1 opacity-80">
            You have {balance} token{balance !== 1 ? "s" : ""} remaining.
            {critical ? " Buy tokens or watch ads to continue using tools." : " Consider topping up soon."}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Link href="/pricing" className="px-3 py-1 rounded-lg text-xs font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition">
              <Coins className="w-3 h-3 inline mr-1" /> Buy Tokens
            </Link>
            <Link href="/earn-tokens" className="px-3 py-1 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition">
              Watch Ads
            </Link>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="p-1 rounded hover:bg-white/10">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
