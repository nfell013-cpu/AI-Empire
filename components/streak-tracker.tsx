"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

export default function StreakTracker() {
  const [streak, setStreak] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [showBonus, setShowBonus] = useState(false);

  useEffect(() => {
    fetch("/api/user/streak", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        setStreak(d.streak ?? 0);
        if (d.bonus > 0 && !d.alreadyClaimed) {
          setBonus(d.bonus);
          setShowBonus(true);
          setTimeout(() => setShowBonus(false), 5000);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-medium">
        <Flame className="w-3.5 h-3.5" />
        <span>{streak}</span>
      </div>
      {showBonus && (
        <div className="absolute top-full right-0 mt-2 px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-medium whitespace-nowrap shadow-lg animate-bounce z-50">
          🎉 +{bonus} bonus tokens for your streak!
        </div>
      )}
    </div>
  );
}
