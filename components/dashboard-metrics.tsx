"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileText, DollarSign, Users, TrendingUp, Zap, ArrowRight, Lock,
  Code2, Image, MessageSquare, Mic, Sparkles, BarChart2, Mail,
  Dumbbell, Languages, Megaphone, Bug, Presentation, ChefHat,
  PenTool, Scale, GraduationCap, Share2, Search, BookOpen, Video,
  ListTodo, Shield, Webhook, Plane, Receipt, Brain, Home, HeartPulse
} from "lucide-react";
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
  { id: 1,  name: "CodeAudit",   description: "AI code review & security vulnerability scanner",       icon: Code2,         href: "/codeaudit",   active: true, color: "#6366f1" },
  { id: 2,  name: "PixelCraft",  description: "AI image generation & editing studio",                  icon: Image,         href: "/pixelcraft",  active: true, color: "#ec4899" },
  { id: 3,  name: "DocuWise",    description: "Intelligent document summarizer & key-point extractor",  icon: FileText,      href: "/docuwise",    active: true, color: "#10b981" },
  { id: 4,  name: "ChatGenius",  description: "Custom AI chatbot builder for businesses",               icon: MessageSquare, href: "/chatgenius",  active: true, color: "#8b5cf6" },
  { id: 5,  name: "VoiceBox",    description: "AI text-to-speech & voice cloning engine",               icon: Mic,           href: "/voicebox",    active: true, color: "#f97316" },
  { id: 6,  name: "BrandSpark",  description: "AI brand name & logo concept generator",                 icon: Sparkles,      href: "/brandspark",  active: true, color: "#eab308" },
  { id: 7,  name: "DataWeave",   description: "Spreadsheet & CSV AI analyst with visualizations",       icon: BarChart2,     href: "/dataweave",   active: true, color: "#06b6d4" },
  { id: 8,  name: "MailPilot",   description: "AI email composer & response optimizer",                 icon: Mail,          href: "/mailpilot",   active: true, color: "#14b8a6" },
  { id: 9,  name: "FitForge",    description: "Personalized AI workout & meal plan generator",          icon: Dumbbell,      href: "/fitforge",    active: true, color: "#ef4444" },
  { id: 10, name: "LexiLearn",   description: "AI language tutor with conversation practice",           icon: Languages,     href: "/lexilearn",   active: true, color: "#a855f7" },
  { id: 11, name: "AdCopy",      description: "AI ad copy & social media content generator",            icon: Megaphone,     href: "/adcopy",      active: true, color: "#f43f5e" },
  { id: 12, name: "BugBuster",   description: "AI debugging assistant & error resolution engine",       icon: Bug,           href: "/bugbuster",   active: true, color: "#22c55e" },
  { id: 13, name: "PitchDeck",   description: "AI startup pitch deck & investor brief builder",         icon: Presentation,  href: "/pitchdeck",   active: true, color: "#0ea5e9" },
  { id: 14, name: "RecipeRx",    description: "AI recipe generator from photos & dietary needs",        icon: ChefHat,       href: "/reciperx",    active: true, color: "#fb923c" },
  { id: 15, name: "StockSense",  description: "AI stock & crypto market analysis with signals",         icon: TrendingUp,    href: "/stocksense",  active: true, color: "#10b981" },
  { id: 16, name: "SketchAI",    description: "Sketch-to-design AI converter for UI/UX",               icon: PenTool,       href: "/sketchai",    active: true, color: "#d946ef" },
  { id: 17, name: "ContractIQ",  description: "AI contract generator & clause analyzer",                icon: Scale,         href: "/contractiq",  active: true, color: "#7c3aed" },
  { id: 18, name: "StudyBlitz",  description: "AI flashcard & quiz generator from any content",         icon: GraduationCap, href: "/studyblitz",  active: true, color: "#0369a1" },
  { id: 19, name: "Socialize",   description: "AI social media scheduler & analytics dashboard",        icon: Share2,        href: "/socialize",   active: true, color: "#e11d48" },
  { id: 20, name: "SEOMaster",   description: "AI SEO audit & keyword strategy optimizer",              icon: Search,        href: "/seomaster",   active: true, color: "#059669" },
  { id: 21, name: "WriteFlow",   description: "AI long-form content writer & blog generator",           icon: BookOpen,      href: "/writeflow",   active: true, color: "#6366f1" },
  { id: 22, name: "VideoSync",   description: "AI video transcription & subtitle generator",            icon: Video,         href: "/videosync",   active: true, color: "#dc2626" },
  { id: 23, name: "TaskFlow",    description: "AI project management & task prioritization",            icon: ListTodo,      href: "/taskflow",    active: true, color: "#2563eb" },
  { id: 24, name: "SecureNet",   description: "AI cybersecurity threat scanner & password auditor",     icon: Shield,        href: "/securenet",   active: true, color: "#b91c1c" },
  { id: 25, name: "APIGen",      description: "AI REST API generator from natural language specs",      icon: Webhook,       href: "/apigen",      active: true, color: "#4f46e5" },
  { id: 26, name: "TravelMate",  description: "AI flight & hotel deal finder with alerts",              icon: Plane,         href: "/travelmate",  active: true, color: "#0891b2" },
  { id: 27, name: "InvoicePro",  description: "AI invoice generator & expense tracker",                 icon: Receipt,       href: "/invoicepro",  active: true, color: "#65a30d" },
  { id: 28, name: "MindMap",     description: "AI brainstorming & mind map visualization tool",         icon: Brain,         href: "/mindmap",     active: true, color: "#c026d3" },
  { id: 29, name: "RealtorIQ",   description: "AI real estate valuation & investment analyzer",         icon: Home,          href: "/realtoriq",   active: true, color: "#ca8a04" },
  { id: 30, name: "HealthPulse", description: "AI symptom checker & wellness recommendation engine",    icon: HeartPulse,    href: "/healthpulse", active: true, color: "#e11d48" },
];

export default function DashboardMetrics() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<{ scanCount: number; freeScanUsed: boolean } | null>(null);

  const totalScans = useCountUp(12540);
  const revenue = useCountUp(87230);
  const activeUsers = useCountUp(4821);

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
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Here&apos;s your AI Empire at a glance — 30 powerful tools at your fingertips.</p>
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

      {/* Free Trial Banner */}
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
              <p className="font-semibold text-sm">You have a free trial available!</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Try any tool to see AI Empire in action.</p>
            </div>
          </div>
          <Link
            href="/codeaudit"
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
                transition={{ delay: 0.3 + i * 0.04, duration: 0.4 }}
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
