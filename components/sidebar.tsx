"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FileText, Cpu, Brain, Sparkles, Code2, Image, Video, Music,
  Globe, Search, Database, ShieldCheck, BarChart2, MessageSquare,
  Zap, LogOut, ChevronRight, Lock, LayoutDashboard, User, ShoppingBag, HardHat,
  Handshake, Leaf, PawPrint, Eye, Trophy
} from "lucide-react";

const TOOLS = [
  { id: 1, name: "Legalese", description: "PDF Contract Scanner", icon: FileText, href: "/legalese", active: true },
  { id: 2, name: "FlipScore", description: "Thrift Item Scanner", icon: ShoppingBag, href: "/flipscore", active: true },
  { id: 3, name: "TradeAce", description: "Vocational Exam Prep", icon: HardHat, href: "/tradeace", active: true },
  { id: 4, name: "DealDone", description: "Brand Negotiation AI", icon: Handshake, href: "/dealdone", active: true },
  { id: 5, name: "LeafCheck", description: "Plant Species ID", icon: Leaf, href: "/leafcheck", active: true },
  { id: 6, name: "PawPair", description: "Pet Compatibility Quiz", icon: PawPrint, href: "/pawpair", active: true },
  { id: 7, name: "VisionLens", description: "Object ID & Valuation", icon: Eye, href: "/visionlens", active: true },
  { id: 8, name: "CoachLogic", description: "Practice Plan Generator", icon: Trophy, href: "/coachlogic", active: true },
  { id: 9, name: "GlobeGuide", description: "AI Travel Itinerary", icon: Globe, href: "/globeguide", active: true },
  { id: 10, name: "SkillScope", description: "Resume Analyzer", icon: Search, href: "/skillscope", active: true },
  { id: 11, name: "DataVault", description: "Finance Analyzer", icon: Database, href: "/datavault", active: true },
  { id: 12, name: "GuardianAI", description: "Reputation Monitor", icon: ShieldCheck, href: "/guardianai", active: true },
  { id: 13, name: "TrendPulse", description: "Market Predictor", icon: BarChart2, href: "/trendpulse", active: true },
  { id: 14, name: "SoundForge", description: "AI Music Generator", icon: Music, href: "/soundforge", active: true },
  { id: 15, name: "MemeMint", description: "AI Meme Generator", icon: MessageSquare, href: "/mememint", active: true },
];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-64 flex flex-col z-40" style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="p-2 rounded-xl" style={{ background: "rgba(99,102,241,0.2)" }}>
          <Zap className="w-5 h-5" style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h1 className="font-bold text-base text-gradient">AI Empire</h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>15 AI Tools</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group"
          style={{
            background: pathname === "/dashboard" ? "rgba(99,102,241,0.15)" : "transparent",
            color: pathname === "/dashboard" ? "var(--accent-light)" : "var(--text-secondary)",
          }}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <div className="pt-3 pb-1 px-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>AI Tools</p>
        </div>

        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = tool.href ? pathname?.startsWith(tool.href) : false;

          if (tool.active && tool.href) {
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
                style={{
                  background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
                  color: isActive ? "var(--accent-light)" : "var(--text-primary)",
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? "var(--accent)" : "var(--accent)" }} />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{tool.name}</div>
                  <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{tool.description}</div>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
              </Link>
            );
          }

          return (
            <div
              key={tool.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all opacity-40 cursor-not-allowed"
            >
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-secondary)" }} />
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ color: "var(--text-secondary)" }}>{tool.name}</div>
                <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{tool.description}</div>
              </div>
              <Lock className="w-3 h-3 flex-shrink-0" style={{ color: "var(--text-secondary)" }} />
            </div>
          );
        })}
      </nav>

      {/* Profile & Logout */}
      <div className="px-4 py-4 space-y-2" style={{ borderTop: "1px solid var(--border)" }}>
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
          style={{ color: "var(--text-secondary)" }}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "rgba(99,102,241,0.2)", color: "var(--accent-light)" }}
          >
            {(userName ?? userEmail ?? "U")[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{userName || "Account"}</p>
            <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{userEmail ?? ""}</p>
          </div>
          <User className="w-3 h-3 flex-shrink-0" />
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
          style={{ color: "var(--text-secondary)" }}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
