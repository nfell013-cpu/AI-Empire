"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, Target, CheckCircle2 } from "lucide-react";

interface UserStats {
  tradeAceSubscribed: boolean;
  tradeAceStreak: number;
  tradeAceTotalQuizzes: number;
  tradeAceCorrectAnswers: number;
  tradeAceSubExpiresAt: string | null;
}

export default function ProgressStats({ userStats }: { userStats: UserStats }) {
  const accuracy = userStats.tradeAceTotalQuizzes > 0
    ? Math.round((userStats.tradeAceCorrectAnswers / (userStats.tradeAceTotalQuizzes * 10)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4"
      style={{ background: "#1f1f1f", border: "1px solid #333" }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ background: "rgba(249,115,22,0.15)" }}>
          <Flame className="w-5 h-5" style={{ color: "#f97316" }} />
        </div>
        <div>
          <p className="text-xs" style={{ color: "#6b7280" }}>Streak</p>
          <p className="font-bold text-lg" style={{ color: "#f97316" }}>{userStats.tradeAceStreak} Days</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ background: "rgba(16,185,129,0.15)" }}>
          <Trophy className="w-5 h-5" style={{ color: "#10b981" }} />
        </div>
        <div>
          <p className="text-xs" style={{ color: "#6b7280" }}>Quizzes</p>
          <p className="font-bold text-lg" style={{ color: "#10b981" }}>{userStats.tradeAceTotalQuizzes}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ background: "rgba(99,102,241,0.15)" }}>
          <CheckCircle2 className="w-5 h-5" style={{ color: "#6366f1" }} />
        </div>
        <div>
          <p className="text-xs" style={{ color: "#6b7280" }}>Correct</p>
          <p className="font-bold text-lg" style={{ color: "#6366f1" }}>{userStats.tradeAceCorrectAnswers}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ background: "rgba(245,158,11,0.15)" }}>
          <Target className="w-5 h-5" style={{ color: "#f59e0b" }} />
        </div>
        <div>
          <p className="text-xs" style={{ color: "#6b7280" }}>Accuracy</p>
          <p className="font-bold text-lg" style={{ color: "#f59e0b" }}>{accuracy}%</p>
        </div>
      </div>
    </motion.div>
  );
}
