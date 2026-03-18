// Enhancement #16: Subscription Management Client
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, CheckCircle, XCircle, ExternalLink, Coins, Crown } from 'lucide-react';

type SubInfo = {
  subscriptions: Record<string, any>;
  tokens: number;
};

export default function SubscriptionsClient() {
  const [data, setData] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => setData({ subscriptions: d.subscriptions ?? {}, tokens: d.tokens ?? 0 }))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6"><div className="shimmer rounded-2xl h-48" /><div className="shimmer rounded-2xl h-48 mt-4" /></div>;

  const subs = data?.subscriptions ?? {};
  const activeSubs = Object.entries(subs).filter(([_, v]: [string, any]) => v?.active);
  const inactiveSubs = Object.entries(subs).filter(([_, v]: [string, any]) => !v?.active);

  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Subscription Management</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your active subscriptions and billing</p>
      </motion.div>

      {/* Token Balance */}
      <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
        <div className="flex items-center gap-3">
          <Coins className="w-6 h-6 text-yellow-400" />
          <div>
            <p className="font-semibold text-yellow-400">{data?.tokens?.toLocaleString() ?? 0} Tokens</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Available balance</p>
          </div>
        </div>
        <a href="/pricing" className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'rgba(234,179,8,0.2)', color: '#eab308' }}>Buy Tokens</a>
      </div>

      {/* Active Subscriptions */}
      <div className="rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Crown className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Active Subscriptions ({activeSubs.length})
          </h3>
        </div>
        {activeSubs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No active subscriptions.</p>
            <a href="/pricing" className="inline-block mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>Browse Plans</a>
          </div>
        ) : activeSubs.map(([key, val]: [string, any]) => (
          <div key={key} className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {key === '_plan' ? `${val.planId ?? 'Tiered'} Plan` : key}
                </p>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {val.activatedAt && <span>Since {new Date(val.activatedAt).toLocaleDateString()}</span>}
                  {val.expiresAt && <span>• Renews {new Date(val.expiresAt).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">Active</span>
          </div>
        ))}
      </div>

      {/* Inactive/Cancelled */}
      {inactiveSubs.length > 0 && (
        <div className="rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Inactive Subscriptions</h3>
          </div>
          {inactiveSubs.map(([key, val]: [string, any]) => (
            <div key={key} className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{key}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Cancelled</span>
            </div>
          ))}
        </div>
      )}

      {/* Billing Info */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Billing & Receipts</h3>
        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Access your payment history and download invoices through Stripe&apos;s customer portal.</p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Payment processing is handled securely by Stripe. No credit card information is stored on our servers.</p>
      </div>
    </div>
  );
}
