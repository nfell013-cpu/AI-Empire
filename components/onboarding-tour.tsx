"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles, Zap, Search, BarChart2, Gift } from "lucide-react";

const STEPS = [
  {
    title: "Welcome to AI Empire! 🚀",
    description: "You have access to 45 powerful AI tools. Let us show you around!",
    icon: Sparkles,
  },
  {
    title: "Your Token Balance ⚡",
    description: "You start with 100 free tokens. Each tool costs tokens to use. Earn more by watching ads or referring friends!",
    icon: Zap,
  },
  {
    title: "Find Any Tool Instantly 🔍",
    description: "Press Cmd+K (or Ctrl+K) anytime to search across all 45 AI tools. Filter by category too!",
    icon: Search,
  },
  {
    title: "Track Your Usage 📊",
    description: "Visit Analytics to see your token spending, tool usage patterns, and ad earning history.",
    icon: BarChart2,
  },
  {
    title: "Refer & Earn 🎁",
    description: "Share your referral link and earn 50 bonus tokens for every friend who signs up!",
    icon: Gift,
  },
];

export default function OnboardingTour() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("ai_empire_onboarded");
    if (!seen) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = () => {
    localStorage.setItem("ai_empire_onboarded", "true");
    setShow(false);
  };

  if (!show) return null;

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-indigo-500" : i < step ? "w-3 bg-indigo-400" : "w-3 bg-gray-600"}`} />
              ))}
            </div>
            <button onClick={finish} className="p-1 rounded-lg hover:bg-white/10 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-indigo-500/20">
              <Icon className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text)]">{current.title}</h3>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-6">{current.description}</p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={finish}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition"
              >
                Get Started! <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
