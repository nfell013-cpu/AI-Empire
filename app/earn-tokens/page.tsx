"use client";

import { useState, useEffect } from "react";
import { Coins, Play, Clock, Gift, TrendingUp, ArrowRight } from "lucide-react";
import WatchAdModal from "@/components/ads/watch-ad-modal";
import Sidebar from "@/components/sidebar";
import { useSession } from "next-auth/react";

interface TokenHistoryItem {
  id: string;
  amount: number;
  balance: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function EarnTokensPage() {
  const { data: session } = useSession();
  const [showAdModal, setShowAdModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<TokenHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchBalance = () => {
    fetch('/api/tokens/balance').then(r => r.json()).then(d => { if (d.balance !== undefined) setBalance(d.balance); }).catch(() => {});
  };

  useEffect(() => {
    fetchBalance();
    fetch('/api/tokens/history').then(r => r.json()).then(d => { setHistory(d.transactions || []); setLoadingHistory(false); }).catch(() => setLoadingHistory(false));
  }, []);

  const user = session?.user as { name?: string; email?: string } | undefined;

  const rewardTiers = [
    { duration: '1-15s', tokens: 3, label: 'Quick View', color: '#94a3b8' },
    { duration: '16-30s', tokens: 5, label: 'Standard', color: '#6366f1' },
    { duration: '31-60s', tokens: 10, label: 'Extended', color: '#a855f7' },
    { duration: '61-120s', tokens: 20, label: 'Premium', color: '#f59e0b' },
    { duration: '120s+', tokens: 30, label: 'Mega', color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar userName={user?.name} userEmail={user?.email} />
      <main className="ml-64 p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <span className="text-gradient">Earn Free Tokens</span>
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Watch ads to earn tokens and use any AI tool for free.</p>
        </div>

        {/* Balance Card */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(239,68,68,0.1))', border: '1px solid rgba(234,179,8,0.3)' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(234,179,8,0.2)' }}>
                <Coins className="w-10 h-10 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your Balance</p>
                <p className="text-4xl font-bold text-yellow-400">{balance.toLocaleString()}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>tokens</p>
              </div>
            </div>
            <button
              onClick={() => setShowAdModal(true)}
              className="px-8 py-4 rounded-2xl font-bold text-lg text-white flex items-center gap-3 transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
            >
              <Play className="w-6 h-6" />
              Watch Ad Now
            </button>
          </div>
        </div>

        {/* Reward Tiers */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Token Reward Tiers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {rewardTiers.map((tier) => (
              <div key={tier.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="p-2 rounded-lg mx-auto w-fit mb-2" style={{ background: `${tier.color}22` }}>
                  <Gift className="w-5 h-5" style={{ color: tier.color }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: tier.color }}>{tier.tokens}</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{tier.label}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-3 h-3 inline" /> {tier.duration}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Token History</h2>
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            {loadingHistory ? (
              <p className="p-6 text-center" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            ) : history.length === 0 ? (
              <p className="p-6 text-center" style={{ color: 'var(--text-secondary)' }}>No token history yet. Watch an ad to get started!</p>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {history.slice(0, 20).map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.description}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(item.createdAt).toLocaleString()} · {item.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${item.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {item.amount > 0 ? '+' : ''}{item.amount}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Bal: {item.balance}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <WatchAdModal isOpen={showAdModal} onClose={() => setShowAdModal(false)} onTokensEarned={() => fetchBalance()} />
      </main>
    </div>
  );
}
