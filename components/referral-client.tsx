// Enhancement #13: Referral Program Client
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Users, Coins, Share2, CheckCircle } from 'lucide-react';

export default function ReferralClient() {
  const [data, setData] = useState<{ referralCode: string; referralLink: string; referralTokensEarned: number; referralCount: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/referral').then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const copyLink = () => {
    if (data?.referralLink) {
      navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="p-6"><div className="shimmer rounded-2xl h-64" /></div>;
  if (!data) return <div className="p-6 text-center" style={{ color: 'var(--text-secondary)' }}>Failed to load referral data.</div>;

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gradient">Referral Program</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Earn 50 tokens for every friend who signs up!</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Friends Referred', value: data.referralCount, icon: Users, color: '#6366f1' },
          { label: 'Tokens Earned', value: data.referralTokensEarned, icon: Coins, color: '#eab308' },
          { label: 'Reward per Referral', value: '50', icon: Gift, color: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <s.icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Your Referral Link</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Share this link with friends. They get 25 bonus tokens too!</p>
        <div className="flex gap-2">
          <input type="text" readOnly value={data.referralLink}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: copied ? '#22c55e' : 'var(--accent)' }}>
            {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Your code:</span>
          <span className="text-sm font-mono font-bold" style={{ color: 'var(--accent)' }}>{data.referralCode}</span>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>How It Works</h3>
        <div className="space-y-4">
          {[
            { step: '1', text: 'Share your unique referral link with friends' },
            { step: '2', text: 'Your friend signs up using your link' },
            { step: '3', text: 'You earn 50 tokens, they get 25 bonus tokens' },
            { step: '4', text: 'Use tokens across all 45 AI tools!' },
          ].map(s => (
            <div key={s.step} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}>{s.step}</div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
