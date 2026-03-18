// Enhancement #14 & #15: Usage History & Token Breakdown Client
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, TrendingDown, Clock, Download, BarChart2 } from 'lucide-react';

type Transaction = {
  id: string;
  amount: number;
  balance: number;
  type: string;
  description: string;
  toolSlug?: string;
  createdAt: string;
};

type UsageData = {
  currentBalance: number;
  totalScans: number;
  memberSince: string;
  transactions: Transaction[];
  breakdownByType: Record<string, number>;
  breakdownByTool: Record<string, number>;
  dailyUsage: Record<string, { earned: number; spent: number }>;
};

export default function UsageHistoryClient() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/user/usage-history')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const exportData = () => {
    window.open('/api/user/export-data', '_blank');
  };

  if (loading) {
    return <div className="p-6"><div className="shimmer rounded-2xl h-48 mb-4" /><div className="shimmer rounded-2xl h-96" /></div>;
  }

  if (!data) return <div className="p-6 text-center" style={{ color: 'var(--text-secondary)' }}>Failed to load usage data.</div>;

  const filteredTx = filter === 'all' ? data.transactions : data.transactions.filter(t => t.type === filter);
  const totalEarned = data.transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalSpent = data.transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Usage Analytics</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Track your token usage and activity</p>
        </div>
        <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}>
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Balance', value: data.currentBalance.toLocaleString(), icon: Coins, color: '#eab308' },
          { label: 'Total Earned', value: totalEarned.toLocaleString(), icon: TrendingUp, color: '#22c55e' },
          { label: 'Total Spent', value: totalSpent.toLocaleString(), icon: TrendingDown, color: '#ef4444' },
          { label: 'Total Scans', value: data.totalScans.toLocaleString(), icon: BarChart2, color: '#6366f1' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: `${s.color}15` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Token Breakdown by Type */}
      {Object.keys(data.breakdownByType).length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Token Breakdown by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(data.breakdownByType).map(([type, amount]) => (
              <div key={type} className="rounded-xl p-3" style={{ background: 'var(--bg-secondary)' }}>
                <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{type}</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Transaction History</h3>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="text-sm rounded-lg px-3 py-1.5 outline-none"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            <option value="all">All</option>
            <option value="usage">Usage</option>
            <option value="purchase">Purchase</option>
            <option value="bonus">Bonus</option>
            <option value="refund">Refund</option>
          </select>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredTx.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No transactions found.</div>
          ) : filteredTx.map(tx => (
            <div key={tx.id} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg" style={{ background: tx.amount > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                  {tx.amount > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="capitalize">{tx.type}</span>
                    {tx.toolSlug && <span>• {tx.toolSlug}</span>}
                    <span>• <Clock className="w-3 h-3 inline" /> {new Date(tx.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: tx.amount > 0 ? '#22c55e' : '#ef4444' }}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Bal: {tx.balance}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
