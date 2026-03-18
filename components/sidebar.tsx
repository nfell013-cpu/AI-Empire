"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Code2, Image, FileText, MessageSquare, Mic, Sparkles, BarChart2,
  Mail, Dumbbell, Languages, Megaphone, Bug, Presentation, ChefHat,
  TrendingUp, PenTool, Scale, GraduationCap, Share2, Search,
  BookOpen, Video, ListTodo, Shield, Webhook, Plane, Receipt,
  Brain, Home, HeartPulse, Zap, LogOut, ChevronRight, Lock,
  LayoutDashboard, User
} from "lucide-react";

const TOOLS = [
  { id: 1,  name: "CodeAudit",   description: "Code Review & Security Scanner",      icon: Code2,          href: "/codeaudit",   active: true },
  { id: 2,  name: "PixelCraft",  description: "AI Image Generation Studio",          icon: Image,          href: "/pixelcraft",  active: true },
  { id: 3,  name: "DocuWise",    description: "Document Summarizer",                 icon: FileText,       href: "/docuwise",    active: true },
  { id: 4,  name: "ChatGenius",  description: "Custom AI Chatbot Builder",           icon: MessageSquare,  href: "/chatgenius",  active: true },
  { id: 5,  name: "VoiceBox",    description: "Text-to-Speech & Voice Cloning",      icon: Mic,            href: "/voicebox",    active: true },
  { id: 6,  name: "BrandSpark",  description: "Brand Name & Logo Generator",         icon: Sparkles,       href: "/brandspark",  active: true },
  { id: 7,  name: "DataWeave",   description: "Spreadsheet AI Analyst",              icon: BarChart2,      href: "/dataweave",   active: true },
  { id: 8,  name: "MailPilot",   description: "AI Email Composer",                   icon: Mail,           href: "/mailpilot",   active: true },
  { id: 9,  name: "FitForge",    description: "Workout & Meal Planner",              icon: Dumbbell,       href: "/fitforge",    active: true },
  { id: 10, name: "LexiLearn",   description: "AI Language Tutor",                   icon: Languages,      href: "/lexilearn",   active: true },
  { id: 11, name: "AdCopy",      description: "Ad & Social Content Generator",       icon: Megaphone,      href: "/adcopy",      active: true },
  { id: 12, name: "BugBuster",   description: "AI Debugging Assistant",              icon: Bug,            href: "/bugbuster",   active: true },
  { id: 13, name: "PitchDeck",   description: "Pitch Deck & Investor Brief",         icon: Presentation,   href: "/pitchdeck",   active: true },
  { id: 14, name: "RecipeRx",    description: "AI Recipe Generator",                 icon: ChefHat,        href: "/reciperx",    active: true },
  { id: 15, name: "StockSense",  description: "Stock & Crypto Analyzer",             icon: TrendingUp,     href: "/stocksense",  active: true },
  { id: 16, name: "SketchAI",    description: "Sketch-to-Design Converter",          icon: PenTool,        href: "/sketchai",    active: true },
  { id: 17, name: "ContractIQ",  description: "Contract Generator & Analyzer",       icon: Scale,          href: "/contractiq",  active: true },
  { id: 18, name: "StudyBlitz",  description: "Flashcard & Quiz Generator",          icon: GraduationCap,  href: "/studyblitz",  active: true },
  { id: 19, name: "Socialize",   description: "Social Media Scheduler",              icon: Share2,         href: "/socialize",   active: true },
  { id: 20, name: "SEOMaster",   description: "SEO Audit & Keyword Optimizer",       icon: Search,         href: "/seomaster",   active: true },
  { id: 21, name: "WriteFlow",   description: "Long-Form Content Writer",            icon: BookOpen,       href: "/writeflow",   active: true },
  { id: 22, name: "VideoSync",   description: "Video Transcription & Subtitles",     icon: Video,          href: "/videosync",   active: true },
  { id: 23, name: "TaskFlow",    description: "AI Project Management",               icon: ListTodo,       href: "/taskflow",    active: true },
  { id: 24, name: "SecureNet",   description: "Cybersecurity Threat Scanner",        icon: Shield,         href: "/securenet",   active: true },
  { id: 25, name: "APIGen",      description: "REST API Generator",                  icon: Webhook,        href: "/apigen",      active: true },
  { id: 26, name: "TravelMate",  description: "Flight & Hotel Deal Finder",          icon: Plane,          href: "/travelmate",  active: true },
  { id: 27, name: "InvoicePro",  description: "Invoice & Expense Tracker",           icon: Receipt,        href: "/invoicepro",  active: true },
  { id: 28, name: "MindMap",     description: "AI Brainstorming Tool",               icon: Brain,          href: "/mindmap",     active: true },
  { id: 29, name: "RealtorIQ",   description: "Real Estate AI Analyzer",             icon: Home,           href: "/realtoriq",   active: true },
  { id: 30, name: "HealthPulse", description: "Symptom Checker & Wellness AI",       icon: HeartPulse,     href: "/healthpulse", active: true },
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
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>30 AI Tools</p>
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
