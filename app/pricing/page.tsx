'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Zap, Check, X, Star, ArrowRight, Coins, Crown,
  Code2, Image, FileText, MessageSquare, Mic, Sparkles, BarChart2, Mail,
  Dumbbell, Languages, Megaphone, Bug, Presentation, ChefHat, TrendingUp,
  PenTool, Scale, GraduationCap, Share2, Search, BookOpen, Video, ListTodo,
  Shield, Webhook, Plane, Receipt, Brain, Home, HeartPulse,
  ShoppingBag, HardHat, Handshake, Leaf, PawPrint, Eye, Trophy, Globe,
  Database, ShieldCheck, Music
} from 'lucide-react';

// ── Tiered Plans ──────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try before you buy',
    features: [
      { text: '1 free scan per tool', included: true },
      { text: 'Earn tokens by watching ads', included: true },
      { text: 'Basic AI analysis', included: true },
      { text: 'Unlimited access', included: false },
      { text: 'Priority processing', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Start Free',
    href: '/auth/signup',
    popular: false,
  },
  {
    name: 'Basic',
    price: '$29.99',
    period: '/month',
    description: '10 AI apps of your choice',
    planId: 'plan_basic',
    features: [
      { text: 'Access to 10 AI apps', included: true },
      { text: 'Unlimited scans & queries', included: true },
      { text: 'Standard processing', included: true },
      { text: 'Pay with Card or Crypto', included: true },
      { text: 'Priority support', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Get Basic',
    href: '/auth/signup?plan=basic',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$69.99',
    period: '/month',
    description: '25 AI apps of your choice',
    planId: 'plan_pro',
    features: [
      { text: 'Access to 25 AI apps', included: true },
      { text: 'Unlimited scans & queries', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Pay with Card or Crypto', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: false },
    ],
    cta: 'Get Pro',
    href: '/auth/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Ultimate',
    price: '$99.99',
    period: '/month',
    description: 'All 45 AI apps — unlimited',
    planId: 'plan_ultimate',
    features: [
      { text: 'All 45 AI apps', included: true },
      { text: 'Unlimited everything', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Pay with Card or Crypto', included: true },
      { text: 'Priority support', included: true },
      { text: 'Full API access', included: true },
    ],
    cta: 'Go Ultimate',
    href: '/auth/signup?plan=ultimate',
    popular: false,
  },
];

// ── Token Packs ───────────────────────────────────────────────────────────
const TOKEN_PACKS = [
  { id: 'pack_100', tokens: '100', price: '$4.99', perToken: '$0.050' },
  { id: 'pack_500', tokens: '500', price: '$19.99', perToken: '$0.040' },
  { id: 'pack_1000', tokens: '1,000', price: '$34.99', perToken: '$0.035', popular: true },
  { id: 'pack_5000', tokens: '5,000', price: '$149.99', perToken: '$0.030' },
  { id: 'pack_10000', tokens: '10,000', price: '$249.99', perToken: '$0.025' },
];

// ── All 45 Individual App Pricing ────────────────────────────────────────
const ICON_MAP: Record<string, any> = {
  Code2, Image, FileText, MessageSquare, Mic, Sparkles, BarChart2, Mail,
  Dumbbell, Languages, Megaphone, Bug, Presentation, ChefHat, TrendingUp,
  PenTool, Scale, GraduationCap, Share2, Search, BookOpen, Video, ListTodo,
  Shield, Webhook, Plane, Receipt, Brain, Home, HeartPulse,
  ShoppingBag, HardHat, Handshake, Leaf, PawPrint, Eye, Trophy, Globe,
  Database, ShieldCheck, Music,
};

const ALL_APPS = [
  { name: 'CodeAudit', icon: 'Code2', category: 'Developer' },
  { name: 'PixelCraft', icon: 'Image', category: 'Creative' },
  { name: 'DocuWise', icon: 'FileText', category: 'Productivity' },
  { name: 'ChatGenius', icon: 'MessageSquare', category: 'Business' },
  { name: 'VoiceBox', icon: 'Mic', category: 'Creative' },
  { name: 'BrandSpark', icon: 'Sparkles', category: 'Marketing' },
  { name: 'DataWeave', icon: 'BarChart2', category: 'Analytics' },
  { name: 'MailPilot', icon: 'Mail', category: 'Productivity' },
  { name: 'FitForge', icon: 'Dumbbell', category: 'Health' },
  { name: 'LexiLearn', icon: 'Languages', category: 'Education' },
  { name: 'AdCopy', icon: 'Megaphone', category: 'Marketing' },
  { name: 'BugBuster', icon: 'Bug', category: 'Developer' },
  { name: 'PitchDeck', icon: 'Presentation', category: 'Business' },
  { name: 'RecipeRx', icon: 'ChefHat', category: 'Lifestyle' },
  { name: 'StockSense', icon: 'TrendingUp', category: 'Finance' },
  { name: 'SketchAI', icon: 'PenTool', category: 'Design' },
  { name: 'ContractIQ', icon: 'Scale', category: 'Legal' },
  { name: 'StudyBlitz', icon: 'GraduationCap', category: 'Education' },
  { name: 'Socialize', icon: 'Share2', category: 'Marketing' },
  { name: 'SEOMaster', icon: 'Search', category: 'Marketing' },
  { name: 'WriteFlow', icon: 'BookOpen', category: 'Content' },
  { name: 'VideoSync', icon: 'Video', category: 'Creative' },
  { name: 'TaskFlow', icon: 'ListTodo', category: 'Productivity' },
  { name: 'SecureNet', icon: 'Shield', category: 'Security' },
  { name: 'APIGen', icon: 'Webhook', category: 'Developer' },
  { name: 'TravelMate', icon: 'Plane', category: 'Travel' },
  { name: 'InvoicePro', icon: 'Receipt', category: 'Finance' },
  { name: 'MindMap', icon: 'Brain', category: 'Productivity' },
  { name: 'RealtorIQ', icon: 'Home', category: 'Real Estate' },
  { name: 'HealthPulse', icon: 'HeartPulse', category: 'Health' },
  { name: 'Legalese', icon: 'FileText', category: 'Legal' },
  { name: 'FlipScore', icon: 'ShoppingBag', category: 'E-Commerce' },
  { name: 'TradeAce', icon: 'HardHat', category: 'Education' },
  { name: 'DealDone', icon: 'Handshake', category: 'Business' },
  { name: 'LeafCheck', icon: 'Leaf', category: 'Nature' },
  { name: 'PawPair', icon: 'PawPrint', category: 'Lifestyle' },
  { name: 'VisionLens', icon: 'Eye', category: 'Vision' },
  { name: 'CoachLogic', icon: 'Trophy', category: 'Sports' },
  { name: 'GlobeGuide', icon: 'Globe', category: 'Travel' },
  { name: 'SkillScope', icon: 'Search', category: 'Career' },
  { name: 'DataVault', icon: 'Database', category: 'Finance' },
  { name: 'GuardianAI', icon: 'ShieldCheck', category: 'Security' },
  { name: 'TrendPulse', icon: 'BarChart2', category: 'Analytics' },
  { name: 'SoundForge', icon: 'Music', category: 'Creative' },
  { name: 'MemeMint', icon: 'MessageSquare', category: 'Social' },
];

type Tab = 'plans' | 'tokens' | 'individual';

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('plans');

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/landing" className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">AI Empire</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-gray-300 hover:text-white transition-colors">
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

      {/* Header */}
      <section className="py-16 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-white mb-4"
        >
          Simple, Transparent Pricing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-400 mb-2"
        >
          Choose a plan, buy tokens, or subscribe per app — your choice
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-sm text-gray-500"
        >
          🎬 Or earn free tokens by watching ads!
        </motion.p>
      </section>

      {/* Tab Switcher */}
      <section className="px-6 mb-12">
        <div className="max-w-md mx-auto flex rounded-xl overflow-hidden border border-[var(--color-border)]">
          {([
            { key: 'plans' as Tab, label: 'Tiered Plans', icon: Crown },
            { key: 'tokens' as Tab, label: 'Token Packs', icon: Coins },
            { key: 'individual' as Tab, label: 'Per App', icon: Zap },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-[var(--color-bg-secondary)] text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Tiered Plans ────────────────────────────────────────────── */}
      {activeTab === 'plans' && (
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-2xl border ${
                  plan.popular
                    ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/50'
                    : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" /> Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 mb-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-400 shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-300' : 'text-gray-500'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90'
                      : 'bg-[var(--color-bg-tertiary)] text-white hover:bg-[var(--color-border)]'
                  }`}
                >
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Token Packs ─────────────────────────────────────────────── */}
      {activeTab === 'tokens' && (
        <section className="px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Buy Token Packs</h2>
              <p className="text-gray-400">Use tokens across any of the 45 AI apps — pay as you go</p>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              {TOKEN_PACKS.map((pack, index) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`relative p-6 rounded-2xl border text-center ${
                    pack.popular
                      ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/50'
                      : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)]'
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-yellow-500 text-black text-xs font-bold">
                      BEST VALUE
                    </div>
                  )}
                  <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{pack.tokens}</div>
                  <div className="text-xs text-gray-500 mb-3">tokens</div>
                  <div className="text-xl font-bold text-white mb-1">{pack.price}</div>
                  <div className="text-xs text-gray-500 mb-4">{pack.perToken}/token</div>
                  <Link
                    href={`/auth/signup?tokens=${pack.id}`}
                    className="block w-full py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    Buy Now
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-6">
              <p className="text-gray-500 text-sm">
                💡 Tip: You can also <Link href="/earn-tokens" className="text-indigo-400 hover:underline">earn free tokens</Link> by watching short ads!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Individual App Subscriptions ─────────────────────────────── */}
      {activeTab === 'individual' && (
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Subscribe Per App — $9.99/mo each</h2>
              <p className="text-gray-400">Only pay for the tools you need</p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {ALL_APPS.map((app, index) => {
                const Icon = ICON_MAP[app.icon] || Zap;
                return (
                  <motion.div
                    key={app.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    viewport={{ once: true }}
                    className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      <span className="text-white font-medium text-sm">{app.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{app.category}</span>
                      <span className="text-indigo-400 font-semibold text-sm">$9.99/mo</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Comparison Banner */}
      <section className="py-12 px-6 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border-y border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Three Ways to Use AI Empire</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Pay-As-You-Go</h3>
              <p className="text-gray-400 text-sm">Buy token packs and use them across any app. Earn free tokens by watching ads.</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <Crown className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Tiered Plans</h3>
              <p className="text-gray-400 text-sm">Subscribe to a plan for unlimited access to 10, 25, or all 45 apps.</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <Zap className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Per App</h3>
              <p className="text-gray-400 text-sm">Subscribe to individual apps at $9.99/mo each. Mix and match as needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-white mb-2">Can I try before subscribing?</h3>
              <p className="text-gray-400">Yes! Each tool offers 1 free scan/query, and you can earn free tokens by watching ads.</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-white mb-2">What are tokens?</h3>
              <p className="text-gray-400">Tokens are a flexible currency you can use across all 45 AI apps. Buy packs or earn them free by watching short ads.</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-400">Absolutely. All subscriptions are month-to-month with no long-term commitment.</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept all major credit cards via Stripe and cryptocurrency via Coinbase Commerce.</p>
            </div>
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
