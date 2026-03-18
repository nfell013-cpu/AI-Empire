'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap, FileText, ShoppingBag, HardHat, Handshake, Leaf, PawPrint, Eye, Trophy,
  Globe, Search, Database, ShieldCheck, BarChart2, MessageSquare, Music, Bitcoin,
  ChevronRight, Star, ArrowRight, Check
} from 'lucide-react';

const TOOLS = [
  { name: 'Legalese', description: 'AI PDF Contract Scanner - Detect auto-renewal traps & hidden fees', icon: FileText, price: '$9.99/scan', color: 'from-blue-500 to-indigo-600', active: true },
  { name: 'FlipScore', description: 'Thrift Item Scanner - Get eBay resale estimates instantly', icon: ShoppingBag, price: '$19/mo', color: 'from-emerald-500 to-green-600', active: true },
  { name: 'TradeAce', description: 'Vocational Exam Prep - Electrician, Plumber, HVAC drills', icon: HardHat, price: '$29/mo', color: 'from-orange-500 to-amber-600', active: true },
  { name: 'DealDone', description: 'Brand Negotiation AI - Counter-offers & fair rate calculator', icon: Handshake, price: '$39/mo', color: 'from-purple-500 to-pink-600', active: true },
  { name: 'LeafCheck', description: 'Plant Species ID - Instant identification & care guides', icon: Leaf, price: '$12/mo', color: 'from-green-500 to-emerald-600', active: true },
  { name: 'PawPair', description: 'Pet Compatibility Quiz - Find your perfect pet match', icon: PawPrint, price: '$14 one-time', color: 'from-pink-500 to-rose-600', active: true },
  { name: 'VisionLens', description: 'Object ID & Valuation - History & estimated value', icon: Eye, price: '$10/mo', color: 'from-cyan-500 to-blue-600', active: true },
  { name: 'CoachLogic', description: 'Practice Plan Generator - Custom 60-min plans', icon: Trophy, price: '$15/mo', color: 'from-orange-500 to-red-600', active: true },
  { name: 'GlobeGuide', description: 'AI Travel Itinerary - Personalized trip planning with local tips', icon: Globe, price: '$18/mo', color: 'from-sky-500 to-blue-600', active: true },
  { name: 'SkillScope', description: 'Resume Analyzer - Job matching & improvement suggestions', icon: Search, price: '$16/mo', color: 'from-fuchsia-500 to-purple-600', active: true },
  { name: 'DataVault', description: 'Finance Analyzer - Spending insights & budget recommendations', icon: Database, price: '$22/mo', color: 'from-teal-500 to-emerald-600', active: true },
  { name: 'GuardianAI', description: 'Reputation Monitor - Protect your online presence', icon: ShieldCheck, price: '$25/mo', color: 'from-red-500 to-orange-600', active: true },
  { name: 'TrendPulse', description: 'Market Predictor - Stock, crypto & commodity analysis', icon: BarChart2, price: '$29/mo', color: 'from-amber-500 to-yellow-600', active: true },
  { name: 'SoundForge', description: 'AI Music Generator - Create unique tracks & audio', icon: Music, price: '$20/mo', color: 'from-violet-500 to-purple-600', active: true },
  { name: 'MemeMint', description: 'AI Meme Generator - Viral memes with viral score', icon: MessageSquare, price: '$8/mo', color: 'from-orange-400 to-amber-500', active: true },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          {/* Navigation */}
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
              <Link
                href="/auth/login"
                className="px-6 py-2 rounded-lg border border-gray-600 text-white hover:bg-white/5 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity"
              >
                Start Free
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm mb-8"
            >
              <Star className="w-4 h-4" />
              15 AI Tools in One Platform
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
              Scan contracts, identify plants, value antiques, prepare for exams, negotiate brand deals, and more - all powered by cutting-edge AI.
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
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">15 Powerful AI Tools</h2>
            <p className="text-xl text-gray-400">Each tool designed to solve a real problem</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${
                    tool.active
                      ? 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:border-indigo-500/50'
                      : 'bg-[var(--color-bg-secondary)]/50 border-[var(--color-border)]/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                        <span className={`text-sm ${tool.active ? 'text-indigo-400' : 'text-gray-500'}`}>
                          {tool.active ? tool.price : 'Coming Soon'}
                        </span>
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

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Workflow?</h2>
            <p className="text-xl text-gray-400 mb-8">Join thousands of users leveraging AI to work smarter.</p>
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
