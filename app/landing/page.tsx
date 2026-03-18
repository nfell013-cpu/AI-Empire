'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap, FileText, ShoppingBag, HardHat, Handshake, Leaf, PawPrint, Eye, Trophy,
  Globe, Search, Database, ShieldCheck, BarChart2, MessageSquare, Music,
  ChevronRight, Star, ArrowRight, Check, Code2, Image as ImageIcon, Mic,
  Sparkles, Mail, Activity, BookOpen, Megaphone, Bug, FileBarChart,
  UtensilsCrossed, TrendingUp, Pencil, Scale, GraduationCap, Share2,
  PenTool, Video, ListChecks, Shield, Braces, Plane, Receipt, Network,
  Building, HeartPulse
} from 'lucide-react';

const NEW_TOOLS = [
  { name: 'CodeAudit', slug: 'codeaudit', description: 'AI code review & security vulnerability scanner', icon: Code2, color: 'from-indigo-500 to-violet-600', category: 'Developer Tools' },
  { name: 'PixelCraft', slug: 'pixelcraft', description: 'AI image generation & editing studio', icon: ImageIcon, color: 'from-pink-500 to-rose-600', category: 'Creative' },
  { name: 'DocuWise', slug: 'docuwise', description: 'Intelligent document summarizer & key-point extractor', icon: FileText, color: 'from-emerald-500 to-green-600', category: 'Productivity' },
  { name: 'ChatGenius', slug: 'chatgenius', description: 'Custom AI chatbot builder for businesses', icon: MessageSquare, color: 'from-purple-500 to-violet-600', category: 'Business' },
  { name: 'VoiceBox', slug: 'voicebox', description: 'AI text-to-speech & voice cloning engine', icon: Mic, color: 'from-orange-500 to-amber-600', category: 'Creative' },
  { name: 'BrandSpark', slug: 'brandspark', description: 'AI brand name & logo concept generator', icon: Sparkles, color: 'from-yellow-500 to-amber-600', category: 'Marketing' },
  { name: 'DataWeave', slug: 'dataweave', description: 'Spreadsheet & CSV AI analyst with visualizations', icon: BarChart2, color: 'from-cyan-500 to-blue-600', category: 'Data & Analytics' },
  { name: 'MailPilot', slug: 'mailpilot', description: 'AI email composer & response optimizer', icon: Mail, color: 'from-teal-500 to-emerald-600', category: 'Productivity' },
  { name: 'FitForge', slug: 'fitforge', description: 'AI personal fitness & workout plan generator', icon: Activity, color: 'from-red-500 to-orange-600', category: 'Health' },
  { name: 'LexiLearn', slug: 'lexilearn', description: 'AI language learning with interactive lessons', icon: BookOpen, color: 'from-blue-500 to-indigo-600', category: 'Education' },
  { name: 'AdCopy', slug: 'adcopy', description: 'AI advertising copy & campaign generator', icon: Megaphone, color: 'from-fuchsia-500 to-pink-600', category: 'Marketing' },
  { name: 'BugBuster', slug: 'bugbuster', description: 'AI debugging assistant - find & fix bugs instantly', icon: Bug, color: 'from-green-500 to-emerald-600', category: 'Developer Tools' },
  { name: 'PitchDeck', slug: 'pitchdeck', description: 'AI investor pitch deck & presentation generator', icon: FileBarChart, color: 'from-violet-500 to-purple-600', category: 'Business' },
  { name: 'RecipeRx', slug: 'reciperx', description: 'AI recipe generator & meal planner', icon: UtensilsCrossed, color: 'from-amber-500 to-orange-600', category: 'Lifestyle' },
  { name: 'StockSense', slug: 'stocksense', description: 'AI stock & market analysis tool', icon: TrendingUp, color: 'from-green-500 to-teal-600', category: 'Finance' },
  { name: 'SketchAI', slug: 'sketchai', description: 'AI UI/UX design & wireframe assistant', icon: Pencil, color: 'from-sky-500 to-blue-600', category: 'Creative' },
  { name: 'ContractIQ', slug: 'contractiq', description: 'AI contract generator & legal analyzer', icon: Scale, color: 'from-slate-500 to-gray-600', category: 'Legal' },
  { name: 'StudyBlitz', slug: 'studyblitz', description: 'AI study guide & flashcard creator', icon: GraduationCap, color: 'from-indigo-500 to-blue-600', category: 'Education' },
  { name: 'Socialize', slug: 'socialize', description: 'AI social media strategy & content planner', icon: Share2, color: 'from-pink-500 to-fuchsia-600', category: 'Marketing' },
  { name: 'SEOMaster', slug: 'seomaster', description: 'AI SEO optimization & keyword analyzer', icon: Search, color: 'from-lime-500 to-green-600', category: 'Marketing' },
  { name: 'WriteFlow', slug: 'writeflow', description: 'AI content writer & blog generator', icon: PenTool, color: 'from-purple-500 to-indigo-600', category: 'Creative' },
  { name: 'VideoSync', slug: 'videosync', description: 'AI video script & production planner', icon: Video, color: 'from-red-500 to-pink-600', category: 'Creative' },
  { name: 'TaskFlow', slug: 'taskflow', description: 'AI project management & task planner', icon: ListChecks, color: 'from-blue-500 to-cyan-600', category: 'Productivity' },
  { name: 'SecureNet', slug: 'securenet', description: 'AI cybersecurity assessment & threat scanner', icon: Shield, color: 'from-red-500 to-rose-600', category: 'Security' },
  { name: 'APIGen', slug: 'apigen', description: 'AI API design & specification generator', icon: Braces, color: 'from-emerald-500 to-teal-600', category: 'Developer Tools' },
  { name: 'TravelMate', slug: 'travelmate', description: 'AI travel itinerary & trip planner', icon: Plane, color: 'from-sky-500 to-indigo-600', category: 'Lifestyle' },
  { name: 'InvoicePro', slug: 'invoicepro', description: 'AI invoice generator & billing tool', icon: Receipt, color: 'from-gray-500 to-slate-600', category: 'Business' },
  { name: 'MindMap', slug: 'mindmap', description: 'AI mind mapping & brainstorming tool', icon: Network, color: 'from-violet-500 to-fuchsia-600', category: 'Productivity' },
  { name: 'RealtorIQ', slug: 'realtoriq', description: 'AI real estate analysis & property valuation', icon: Building, color: 'from-amber-500 to-yellow-600', category: 'Finance' },
  { name: 'HealthPulse', slug: 'healthpulse', description: 'AI health insights & wellness advisor', icon: HeartPulse, color: 'from-rose-500 to-red-600', category: 'Health' },
];

const LEGACY_TOOLS = [
  { name: 'Legalese', slug: 'legalese', description: 'AI PDF Contract Scanner - Detect auto-renewal traps & hidden fees', icon: FileText, color: 'from-blue-500 to-indigo-600' },
  { name: 'FlipScore', slug: 'flipscore', description: 'Thrift Item Scanner - Get eBay resale estimates instantly', icon: ShoppingBag, color: 'from-emerald-500 to-green-600' },
  { name: 'TradeAce', slug: 'tradeace', description: 'Vocational Exam Prep - Electrician, Plumber, HVAC drills', icon: HardHat, color: 'from-orange-500 to-amber-600' },
  { name: 'DealDone', slug: 'dealdone', description: 'Brand Negotiation AI - Counter-offers & fair rate calculator', icon: Handshake, color: 'from-purple-500 to-pink-600' },
  { name: 'LeafCheck', slug: 'leafcheck', description: 'Plant Species ID - Instant identification & care guides', icon: Leaf, color: 'from-green-500 to-emerald-600' },
  { name: 'PawPair', slug: 'pawpair', description: 'Pet Compatibility Quiz - Find your perfect pet match', icon: PawPrint, color: 'from-pink-500 to-rose-600' },
  { name: 'VisionLens', slug: 'visionlens', description: 'Object ID & Valuation - History & estimated value', icon: Eye, color: 'from-cyan-500 to-blue-600' },
  { name: 'CoachLogic', slug: 'coachlogic', description: 'Practice Plan Generator - Custom 60-min plans', icon: Trophy, color: 'from-orange-500 to-red-600' },
  { name: 'GlobeGuide', slug: 'globeguide', description: 'AI Travel Itinerary - Personalized trip planning with local tips', icon: Globe, color: 'from-sky-500 to-blue-600' },
  { name: 'SkillScope', slug: 'skillscope', description: 'Resume Analyzer - Job matching & improvement suggestions', icon: Search, color: 'from-fuchsia-500 to-purple-600' },
  { name: 'DataVault', slug: 'datavault', description: 'Finance Analyzer - Spending insights & budget recommendations', icon: Database, color: 'from-teal-500 to-emerald-600' },
  { name: 'GuardianAI', slug: 'guardianai', description: 'Reputation Monitor - Protect your online presence', icon: ShieldCheck, color: 'from-red-500 to-orange-600' },
  { name: 'TrendPulse', slug: 'trendpulse', description: 'Market Predictor - Stock, crypto & commodity analysis', icon: BarChart2, color: 'from-amber-500 to-yellow-600' },
  { name: 'SoundForge', slug: 'soundforge', description: 'AI Music Generator - Create unique tracks & audio', icon: Music, color: 'from-violet-500 to-purple-600' },
  { name: 'MemeMint', slug: 'mememint', description: 'AI Meme Generator - Viral memes with viral score', icon: MessageSquare, color: 'from-orange-400 to-amber-500' },
];

const ALL_TOOLS = [...NEW_TOOLS, ...LEGACY_TOOLS];

// Get unique categories
const categories = [...new Set(NEW_TOOLS.map(t => t.category))];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">AI Empire</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/auth/login" className="px-6 py-2 rounded-lg border border-gray-600 text-white hover:bg-white/5 transition-colors">
                Login
              </Link>
              <Link href="/auth/signup" className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity">
                Start Free
              </Link>
            </div>
          </nav>

          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm mb-8"
            >
              <Star className="w-4 h-4" />
              45 AI Tools in One Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Your Complete
              <span className="text-gradient"> AI Toolkit</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
            >
              45 powerful AI tools for developers, creators, marketers, and businesses.
              Code auditing, image generation, SEO, invoicing, health insights, and so much more.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4"
            >
              <Link
                href="/auth/signup"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                Start Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 rounded-xl border border-gray-600 text-white font-medium text-lg hover:bg-white/5 transition-colors"
              >
                View Pricing
              </Link>
            </motion.div>

            {/* Category pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-10"
            >
              {categories.map(cat => (
                <span key={cat} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
                  {cat}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* New 30 Tools Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">30 Brand New AI Tools</h2>
            <p className="text-xl text-gray-400">Cutting-edge AI powered by GPT-4o — token-based pay-as-you-go</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {NEW_TOOLS.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl border bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:border-indigo-500/50 transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">{tool.category}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{tool.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Legacy Tools */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">+ 15 Legacy AI Tools</h2>
            <p className="text-lg text-gray-400">Our original suite of specialized AI tools — still fully functional</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEGACY_TOOLS.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  viewport={{ once: true }}
                  className="p-5 rounded-xl border bg-[var(--color-bg-secondary)]/70 border-[var(--color-border)] hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{tool.name}</h3>
                      <p className="text-gray-500 text-xs">{tool.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Token Economy Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">🪙 Token-Based Economy</h2>
              <p className="text-gray-400">Use tokens to access all 45 AI tools. Earn tokens by watching ads or purchase them directly.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-xl bg-white/5">
                <div className="text-3xl mb-2">🎬</div>
                <h3 className="font-semibold text-white mb-1">Watch Ads</h3>
                <p className="text-gray-400 text-sm">Earn free tokens by watching short ads from our partners</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold text-white mb-1">Buy Tokens</h3>
                <p className="text-gray-400 text-sm">Purchase token packages starting at $4.99 for 50 tokens</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-white mb-1">Use Tools</h3>
                <p className="text-gray-400 text-sm">Each tool use costs 1 token — simple and predictable</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Workflow?</h2>
            <p className="text-xl text-gray-400 mb-8">Join thousands of users leveraging 45 AI tools to work smarter.</p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-lg hover:opacity-90 transition-opacity"
            >
              Get Started Free <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">AI Empire</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 AI Empire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
