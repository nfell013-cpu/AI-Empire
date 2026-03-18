'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap, Check, X, Star, ArrowRight, Bitcoin, Music, MessageSquare,
  FileText, ShoppingBag, HardHat, Handshake, Leaf, PawPrint, Eye, Trophy,
  Globe, Search, Database, ShieldCheck, BarChart2
} from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try before you buy',
    features: [
      { text: '1 free scan per tool', included: true },
      { text: 'Basic AI analysis', included: true },
      { text: 'Email support', included: true },
      { text: 'Unlimited access', included: false },
      { text: 'Priority processing', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Start Free',
    href: '/auth/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'Perfect for individuals',
    features: [
      { text: 'All 15 AI tools', included: true },
      { text: 'Unlimited scans & queries', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Advanced AI analysis', included: true },
      { text: 'Pay with Card or Crypto', included: true },
      { text: 'API access', included: false },
    ],
    cta: 'Get Pro',
    href: '/auth/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Empire',
    price: '$99',
    period: '/month',
    description: 'For power users & teams',
    features: [
      { text: 'All 15 AI tools', included: true },
      { text: 'Unlimited everything', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Pay with Card or Crypto', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: true },
    ],
    cta: 'Go Empire',
    href: '/auth/signup?plan=empire',
    popular: false,
  },
];

const TOOL_PRICING = [
  { name: 'Legalese', icon: FileText, price: '$9.99/scan', description: 'Contract Scanner' },
  { name: 'FlipScore', icon: ShoppingBag, price: '$19/mo', description: 'Thrift Scanner' },
  { name: 'TradeAce', icon: HardHat, price: '$29/mo', description: 'Exam Prep' },
  { name: 'DealDone', icon: Handshake, price: '$39/mo', description: 'Brand Negotiation' },
  { name: 'LeafCheck', icon: Leaf, price: '$12/mo', description: 'Plant ID' },
  { name: 'PawPair', icon: PawPrint, price: '$14 one-time', description: 'Pet Quiz' },
  { name: 'VisionLens', icon: Eye, price: '$10/mo', description: 'Object ID' },
  { name: 'CoachLogic', icon: Trophy, price: '$15/mo', description: 'Practice Plans' },
  { name: 'GlobeGuide', icon: Globe, price: '$18/mo', description: 'Travel Itinerary' },
  { name: 'SkillScope', icon: Search, price: '$16/mo', description: 'Resume Analyzer' },
  { name: 'DataVault', icon: Database, price: '$22/mo', description: 'Finance Analyzer' },
  { name: 'GuardianAI', icon: ShieldCheck, price: '$25/mo', description: 'Reputation Monitor' },
  { name: 'TrendPulse', icon: BarChart2, price: '$29/mo', description: 'Market Predictor' },
  { name: 'SoundForge', icon: Music, price: '$20/mo', description: 'Music Generator' },
  { name: 'MemeMint', icon: MessageSquare, price: '$8/mo', description: 'Meme Generator' },
];

export default function PricingPage() {
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
          className="text-xl text-gray-400"
        >
          Choose a plan or pay per tool - your choice
        </motion.p>
      </section>

      {/* Pricing Tiers */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
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
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 mb-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-gray-600" />
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

      {/* Individual Tool Pricing */}
      <section className="py-20 px-6 bg-[var(--color-bg-secondary)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Or Pay Per Tool</h2>
            <p className="text-gray-400">Only pay for what you need</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOL_PRICING.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-indigo-400" />
                    <span className="text-white font-medium">{tool.name}</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{tool.description}</p>
                  <p className="text-indigo-400 font-semibold">{tool.price}</p>
                </motion.div>
              );
            })}
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
              <p className="text-gray-400">Yes! Each tool offers 1 free scan/query so you can test it out before committing to a subscription.</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-400">Absolutely. All subscriptions are month-to-month with no long-term commitment. Cancel with one click.</p>
            </div>
            <div className="p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept all major credit cards through Stripe. Your payment information is securely processed.</p>
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
