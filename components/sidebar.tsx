"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  FileText, Cpu, Brain, Sparkles, Code2, Image as ImageIcon, Video, Music,
  Globe, Search, Database, ShieldCheck, BarChart2, MessageSquare,
  Zap, LogOut, ChevronRight, Lock, LayoutDashboard, User, ShoppingBag, HardHat,
  Handshake, Leaf, PawPrint, Eye, Trophy, Coins, Mic, Mail, Dumbbell,
  BookOpen, Megaphone, Bug, FileBarChart, UtensilsCrossed, TrendingUp,
  Pencil, Scale, GraduationCap, Share2, PenTool, ListChecks, Shield,
  Braces, Plane, Receipt, Network, Building, HeartPulse, Activity,
  Settings, Crown, CreditCard
} from "lucide-react";
import EarnTokensButton from "./ads/earn-tokens-button";

const OLD_TOOLS = [
  { id: "old-1", name: "Legalese", description: "PDF Contract Scanner", icon: FileText, href: "/legalese", active: true, category: "Legacy" },
  { id: "old-2", name: "FlipScore", description: "Thrift Item Scanner", icon: ShoppingBag, href: "/flipscore", active: true, category: "Legacy" },
  { id: "old-3", name: "TradeAce", description: "Vocational Exam Prep", icon: HardHat, href: "/tradeace", active: true, category: "Legacy" },
  { id: "old-4", name: "DealDone", description: "Brand Negotiation AI", icon: Handshake, href: "/dealdone", active: true, category: "Legacy" },
  { id: "old-5", name: "LeafCheck", description: "Plant Species ID", icon: Leaf, href: "/leafcheck", active: true, category: "Legacy" },
  { id: "old-6", name: "PawPair", description: "Pet Compatibility Quiz", icon: PawPrint, href: "/pawpair", active: true, category: "Legacy" },
  { id: "old-7", name: "VisionLens", description: "Object ID & Valuation", icon: Eye, href: "/visionlens", active: true, category: "Legacy" },
  { id: "old-8", name: "CoachLogic", description: "Practice Plan Generator", icon: Trophy, href: "/coachlogic", active: true, category: "Legacy" },
  { id: "old-9", name: "GlobeGuide", description: "AI Travel Itinerary", icon: Globe, href: "/globeguide", active: true, category: "Legacy" },
  { id: "old-10", name: "SkillScope", description: "Resume Analyzer", icon: Search, href: "/skillscope", active: true, category: "Legacy" },
  { id: "old-11", name: "DataVault", description: "Finance Analyzer", icon: Database, href: "/datavault", active: true, category: "Legacy" },
  { id: "old-12", name: "GuardianAI", description: "Reputation Monitor", icon: ShieldCheck, href: "/guardianai", active: true, category: "Legacy" },
  { id: "old-13", name: "TrendPulse", description: "Market Predictor", icon: BarChart2, href: "/trendpulse", active: true, category: "Legacy" },
  { id: "old-14", name: "SoundForge", description: "AI Music Generator", icon: Music, href: "/soundforge", active: true, category: "Legacy" },
  { id: "old-15", name: "MemeMint", description: "AI Meme Generator", icon: MessageSquare, href: "/mememint", active: true, category: "Legacy" },
];

const NEW_TOOLS = [
  { id: 1, name: "CodeAudit", description: "Code Review & Security Scanner", icon: Code2, href: "/codeaudit", active: true, category: "Developer Tools" },
  { id: 2, name: "PixelCraft", description: "AI Image Generation Studio", icon: ImageIcon, href: "/pixelcraft", active: true, category: "Creative" },
  { id: 3, name: "DocuWise", description: "Document Summarizer", icon: FileText, href: "/docuwise", active: true, category: "Productivity" },
  { id: 4, name: "ChatGenius", description: "Custom Chatbot Builder", icon: MessageSquare, href: "/chatgenius", active: true, category: "Business" },
  { id: 5, name: "VoiceBox", description: "Text-to-Speech Engine", icon: Mic, href: "/voicebox", active: true, category: "Creative" },
  { id: 6, name: "BrandSpark", description: "Brand Name Generator", icon: Sparkles, href: "/brandspark", active: true, category: "Marketing" },
  { id: 7, name: "DataWeave", description: "CSV & Data Analyst", icon: BarChart2, href: "/dataweave", active: true, category: "Data & Analytics" },
  { id: 8, name: "MailPilot", description: "AI Email Composer", icon: Mail, href: "/mailpilot", active: true, category: "Productivity" },
  { id: 9, name: "FitForge", description: "AI Fitness Planner", icon: Activity, href: "/fitforge", active: true, category: "Health" },
  { id: 10, name: "LexiLearn", description: "Language Learning AI", icon: BookOpen, href: "/lexilearn", active: true, category: "Education" },
  { id: 11, name: "AdCopy", description: "Ad Copywriter AI", icon: Megaphone, href: "/adcopy", active: true, category: "Marketing" },
  { id: 12, name: "BugBuster", description: "AI Debugging Assistant", icon: Bug, href: "/bugbuster", active: true, category: "Developer Tools" },
  { id: 13, name: "PitchDeck", description: "Investor Pitch Generator", icon: FileBarChart, href: "/pitchdeck", active: true, category: "Business" },
  { id: 14, name: "RecipeRx", description: "AI Recipe Generator", icon: UtensilsCrossed, href: "/reciperx", active: true, category: "Lifestyle" },
  { id: 15, name: "StockSense", description: "Market Analysis AI", icon: TrendingUp, href: "/stocksense", active: true, category: "Finance" },
  { id: 16, name: "SketchAI", description: "UI/UX Design Assistant", icon: Pencil, href: "/sketchai", active: true, category: "Creative" },
  { id: 17, name: "ContractIQ", description: "Contract Generator", icon: Scale, href: "/contractiq", active: true, category: "Legal" },
  { id: 18, name: "StudyBlitz", description: "Study Guide Creator", icon: GraduationCap, href: "/studyblitz", active: true, category: "Education" },
  { id: 19, name: "Socialize", description: "Social Media Strategist", icon: Share2, href: "/socialize", active: true, category: "Marketing" },
  { id: 20, name: "SEOMaster", description: "SEO Optimization Tool", icon: Search, href: "/seomaster", active: true, category: "Marketing" },
  { id: 21, name: "WriteFlow", description: "AI Content Writer", icon: PenTool, href: "/writeflow", active: true, category: "Creative" },
  { id: 22, name: "VideoSync", description: "Video Production AI", icon: Video, href: "/videosync", active: true, category: "Creative" },
  { id: 23, name: "TaskFlow", description: "Project Management AI", icon: ListChecks, href: "/taskflow", active: true, category: "Productivity" },
  { id: 24, name: "SecureNet", description: "Cybersecurity Assessment", icon: Shield, href: "/securenet", active: true, category: "Security" },
  { id: 25, name: "APIGen", description: "API Generator", icon: Braces, href: "/apigen", active: true, category: "Developer Tools" },
  { id: 26, name: "TravelMate", description: "Travel Planner AI", icon: Plane, href: "/travelmate", active: true, category: "Lifestyle" },
  { id: 27, name: "InvoicePro", description: "Invoice Generator", icon: Receipt, href: "/invoicepro", active: true, category: "Business" },
  { id: 28, name: "MindMap", description: "Mind Mapping Tool", icon: Network, href: "/mindmap", active: true, category: "Productivity" },
  { id: 29, name: "RealtorIQ", description: "Real Estate Analyzer", icon: Building, href: "/realtoriq", active: true, category: "Finance" },
  { id: 30, name: "HealthPulse", description: "Health & Wellness AI", icon: HeartPulse, href: "/healthpulse", active: true, category: "Health" },
];

const TOOLS = [...NEW_TOOLS, ...OLD_TOOLS];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  const fetchBalance = () => {
    fetch("/api/tokens/balance")
      .then(r => r.json())
      .then(d => { if (d.balance !== undefined) setTokenBalance(d.balance); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <aside className="fixed top-0 left-0 h-full w-64 flex flex-col z-40" style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="p-2 rounded-xl" style={{ background: "rgba(99,102,241,0.2)" }}>
          <Zap className="w-5 h-5" style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h1 className="font-bold text-base text-gradient">AI Empire</h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>45 AI Tools</p>
        </div>
      </div>

      {/* Token Balance & Earn Button */}
      <div className="px-3 py-3 space-y-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "rgba(234,179,8,0.1)" }}>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">
              {tokenBalance !== null ? tokenBalance.toLocaleString() : '...'} tokens
            </span>
          </div>
          <Link href="/earn-tokens" className="text-xs hover:underline" style={{ color: "var(--accent)" }}>
            Earn more
          </Link>
        </div>
        <EarnTokensButton compact={false} onTokensEarned={() => fetchBalance()} />
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

        <Link
          href="/dashboard/analytics"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group"
          style={{
            background: pathname === "/dashboard/analytics" ? "rgba(99,102,241,0.15)" : "transparent",
            color: pathname === "/dashboard/analytics" ? "var(--accent-light)" : "var(--text-secondary)",
          }}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Analytics</span>
        </Link>

        {/* Enhancement #14: Usage History */}
        <Link
          href="/dashboard/usage"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group"
          style={{
            background: pathname === "/dashboard/usage" ? "rgba(99,102,241,0.15)" : "transparent",
            color: pathname === "/dashboard/usage" ? "var(--accent-light)" : "var(--text-secondary)",
          }}
        >
          <Activity className="w-4 h-4" />
          <span>Usage History</span>
        </Link>

        {/* Enhancement #13: Referral Program */}
        <Link
          href="/dashboard/referrals"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group"
          style={{
            background: pathname === "/dashboard/referrals" ? "rgba(99,102,241,0.15)" : "transparent",
            color: pathname === "/dashboard/referrals" ? "var(--accent-light)" : "var(--text-secondary)",
          }}
        >
          <Share2 className="w-4 h-4" />
          <span>Referrals</span>
        </Link>

        {/* Enhancement #16: Subscriptions */}
        <Link
          href="/dashboard/subscriptions"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group"
          style={{
            background: pathname === "/dashboard/subscriptions" ? "rgba(99,102,241,0.15)" : "transparent",
            color: pathname === "/dashboard/subscriptions" ? "var(--accent-light)" : "var(--text-secondary)",
          }}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscriptions</span>
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

      {/* Admin Section - only visible to admins */}
      {isAdmin && (
        <div className="px-3 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 px-3 py-1 mb-2">
            <Crown className="w-3.5 h-3.5 text-yellow-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Admin</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: pathname === "/admin/dashboard" ? "rgba(234,179,8,0.15)" : "transparent",
              color: pathname === "/admin/dashboard" ? "#facc15" : "var(--text-secondary)",
            }}
          >
            <Settings className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>
          <Link
            href="/admin/ads"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: pathname === "/admin/ads" ? "rgba(234,179,8,0.15)" : "transparent",
              color: pathname === "/admin/ads" ? "#facc15" : "var(--text-secondary)",
            }}
          >
            <Megaphone className="w-4 h-4" />
            <span>Ad Management</span>
          </Link>
          <Link
            href="/advertise/analytics"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: pathname === "/advertise/analytics" ? "rgba(234,179,8,0.15)" : "transparent",
              color: pathname === "/advertise/analytics" ? "#facc15" : "var(--text-secondary)",
            }}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Advertiser Analytics</span>
          </Link>
        </div>
      )}

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
