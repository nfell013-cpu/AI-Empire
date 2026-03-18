'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Handshake, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  Loader2, 
  Send, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Crown
} from 'lucide-react';

interface UserStats {
  dealDoneSubscribed: boolean;
  dealDoneNegotiations: number;
  dealDoneSubExpiresAt: string | null;
}

interface NegotiationResult {
  brandName: string;
  originalOffer: string;
  counterOffer: string;
  fairRateRange: { min: number; max: number };
  negotiationTips: string[];
  redFlags: string[];
  strengthPoints: string[];
}

export function DealDoneClient() {
  const { data: session } = useSession() || {};
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [brandDM, setBrandDM] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/dealdone/stats');
      const data = await res.json();
      setUserStats(data);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }

  async function handleSubscribe() {
    setSubscribing(true);
    try {
      const res = await fetch('/api/dealdone/subscribe', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error('Failed to subscribe:', e);
    } finally {
      setSubscribing(false);
    }
  }

  async function handleAnalyze() {
    if (!brandDM.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/dealdone/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: brandDM }),
      });

      if (res.status === 402) {
        setError('Subscription required. Please subscribe to DealDone Pro.');
        return;
      }

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        fetchStats();
      }
    } catch (e) {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Handshake className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">DealDone</h1>
            <p className="text-gray-400">AI-Powered Brand Negotiation Assistant</p>
          </div>
        </div>
      </motion.div>

      {/* Subscription Banner */}
      {userStats && !userStats.dealDoneSubscribed && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-white font-medium">Unlock DealDone Pro</p>
                <p className="text-gray-400 text-sm">Get AI-powered counter-offers and fair rate calculations</p>
              </div>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Subscribe $39/mo
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Bar */}
      {userStats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Negotiations</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.dealDoneNegotiations}</p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Status</span>
            </div>
            <p className="text-lg font-medium text-white">
              {userStats.dealDoneSubscribed ? 'Pro Active' : 'Free'}
            </p>
          </div>
          {userStats.dealDoneSubExpiresAt && (
            <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2 text-yellow-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Renews</span>
              </div>
              <p className="text-lg font-medium text-white">
                {new Date(userStats.dealDoneSubExpiresAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Main Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--color-bg-secondary)] rounded-2xl p-6 border border-[var(--color-border)] mb-8"
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          Paste Brand DM
        </h2>
        <p className="text-gray-400 mb-4">Paste the brand's offer or DM and get an AI-powered counter-offer with fair rate calculations.</p>
        
        <textarea
          value={brandDM}
          onChange={(e) => setBrandDM(e.target.value)}
          placeholder={`Example:\n"Hi! We love your content and would love to partner with you. We can offer $200 for 1 Instagram post and 2 stories featuring our new skincare line. Let us know if you're interested!"`}
          className="w-full h-48 p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleAnalyze}
            disabled={loading || !brandDM.trim() || (!userStats?.dealDoneSubscribed)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
            ) : (
              <><Send className="w-5 h-5" /> Get Counter-Offer</>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </motion.div>

      {/* Results */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Fair Rate Range */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Fair Rate Range
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Minimum</p>
                <p className="text-3xl font-bold text-green-400">${result.fairRateRange.min}</p>
              </div>
              <div className="flex-1 h-2 bg-[var(--color-bg-tertiary)] rounded-full">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: '100%' }} />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Maximum</p>
                <p className="text-3xl font-bold text-emerald-400">${result.fairRateRange.max}</p>
              </div>
            </div>
          </div>

          {/* Counter Offer */}
          <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-6 border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Counter-Offer Template
              </h3>
              <button
                onClick={() => copyToClipboard(result.counterOffer)}
                className="px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] transition-colors flex items-center gap-2 text-sm text-gray-300"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <p className="text-gray-200 whitespace-pre-wrap">{result.counterOffer}</p>
            </div>
          </div>

          {/* Red Flags & Strength Points */}
          <div className="grid md:grid-cols-2 gap-6">
            {result.redFlags.length > 0 && (
              <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Red Flags
                </h3>
                <ul className="space-y-2">
                  {result.redFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-red-300">
                      <span className="text-red-500">•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.strengthPoints.length > 0 && (
              <div className="bg-green-500/10 rounded-2xl p-6 border border-green-500/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Strength Points
                </h3>
                <ul className="space-y-2">
                  {result.strengthPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-green-300">
                      <span className="text-green-500">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Negotiation Tips */}
          <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-6 border border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              Negotiation Tips
            </h3>
            <ul className="space-y-3">
              {result.negotiationTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-medium">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
