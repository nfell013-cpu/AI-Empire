"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, DollarSign, Users, TrendingUp, Zap, ArrowRight, Lock, ShoppingBag, HardHat, Handshake, Leaf, PawPrint, Eye, Trophy, Globe, Search, Database, ShieldCheck, BarChart2, Music, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

const TOOLS = [
  { id: 1, name: "Legalese", description: "PDF Contract Scanner – Detect auto-renewals & hidden fees", icon: FileText, href: "/legalese", active: true, color: "#6366f1" },
  { id: 2, name: "FlipScore", description: "Thrift Item Scanner – Get eBay resale estimates", icon: ShoppingBag, href: "/flipscore", active: true, color: "#10b981" },
  { id: 3, name: "TradeAce", description: "Vocational Exam Prep – Electrician, Plumber, HVAC", icon: HardHat, href: "/tradeace", active: true, color: "#f97316" },
  { id: 4, name: "DealDone", description: "Brand Negotiation AI – Counter-offers & fair rates", icon: Handshake, href: "/dealdone", active: true, color: "#a855f7" },
  { id: 5, name: "LeafCheck", description: "Plant Species ID – Identification & care guides", icon: Leaf, href: "/leafcheck", active: true, color: "#22c55e" },
  { id: 6, name: "PawPair", description: "Pet Compatibility Quiz – Find your perfect pet", icon: PawPrint, href: "/pawpair", active: true, color: "#ec4899" },
  { id: 7, name: "VisionLens", description: "Object ID & Valuation – History & value estimates", icon: Eye, href: "/visionlens", active: true, color: "#06b6d4" },
  { id: 8, name: "CoachLogic", description: "Practice Plan Generator – Custom sports plans", icon: Trophy, href: "/coachlogic", active: true, color: "#ef4444" },
  { id: 9, name: "GlobeGuide", description: "AI Travel Itinerary – Personalized trip planning", icon: Globe, href: "/globeguide", active: true, color: "#0ea5e9" },
  { id: 10, name: "SkillScope", description: "Resume Analyzer – Job matching & improvements", icon: Search, href: "/skillscope", active: true, color: "#d946ef" },
  { id: 11, name: "DataVault", description: "Finance Analyzer – Spending insights & budgets", icon: Database, href: "/datavault", active: true, color: "#14b8a6" },
  { id: 12, name: "GuardianAI", description: "Reputation Monitor – Online presence protection", icon: ShieldCheck, href: "/guardianai", active: true, color: "#f43f5e" },
  { id: 13, name: "TrendPulse", description: "Market Predictor – Stock & crypto analysis", icon: BarChart2, href: "/trendpulse", active: true, color: "#eab308" },
  { id: 14, name: "SoundForge", description: "AI Music Generator – Create unique tracks & audio", icon: Music, href: "/soundforge", active: true, color: "#7c3aed" },
  { id: 15, name: "MemeMint", description: "AI Meme Generator – Viral memes in seconds", icon: MessageSquare, href: "/mememint", active: true, color: "#fb923c" },
];

export default function DashboardMetrics() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<{ scanCount: number; freeScanUsed: boolean } | null>(null);

  const totalScans = useCountUp(3847);
  const revenue = useCountUp(28312);
  const activeUsers = useCountUp(1204);

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then((d) => setUserStats(d))
      .catch(console.error);
  }, []);

  const user = session?.user as { name?: string } | undefined;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome back, <span className="text-gradient">{user?.name ?? "Commander"}</span>
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Here&apos;s your AI Empire at a glance.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Scans", value: totalScans.toLocaleString(), icon: FileText, suffix: "", color: "#6366f1" },
          { label: "Revenue", value: `$${revenue.toLocaleString()}`, icon: DollarSign, suffix: "", color: "#10b981" },
          { label: "Active Users", value: activeUsers.toLocaleString(), icon: Users, suffix: "", color: "#f59e0b" },
          { label: "Your Scans", value: userStats?.scanCount?.toString() ?? "0", icon: TrendingUp, suffix: " used", color: "#8b5cf6" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="rounded-2xl p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
              <div className="p-2 rounded-xl" style={{ background: `${stat.color}22` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {stat.value}{stat.suffix}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Free Scan Banner */}
      {userStats && !userStats.freeScanUsed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-5 flex items-center justify-between gap-4 glow-accent"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.4)" }}
        >
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6" style={{ color: "var(--accent)" }} />
            <div>
              <p className="font-semibold text-sm">You have 1 free scan remaining!</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Try Legalese to scan your contracts for hidden traps.</p>
            </div>
          </div>
          <Link
            href="/legalese"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
            style={{ background: "var(--accent)", color: "white" }}
          >
            Try Now <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* Tools Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your AI Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              >
                {tool.active && tool.href ? (
                  <Link
                    href={tool.href}
                    className="block rounded-2xl p-5 transition-all group"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-xl mb-3" style={{ background: `${tool.color}22` }}>
                        <Icon className="w-5 h-5" style={{ color: tool.color }} />
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: tool.color }} />
                    </div>
                    <h3 className="font-semibold text-sm">{tool.name}</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{tool.description}</p>
                  </Link>
                ) : (
                  <div
                    className="rounded-2xl p-5 opacity-50 cursor-not-allowed"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-xl mb-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <Lock className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm" style={{ color: "var(--text-secondary)" }}>{tool.name}</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{tool.description}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}