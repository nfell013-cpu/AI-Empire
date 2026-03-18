'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { DollarSign, Users, Coins, Eye, TrendingUp, BarChart2 } from 'lucide-react';

interface RevenueData {
  overview: {
    totalUsers: number;
    recentSignups: number;
    tokensPurchased: number;
    tokenRevenue: number;
    adRevenue: number;
    totalAdViews: number;
  };
  dailySignups: Array<{ day: string; count: number }>;
  topTools: Array<{ tool: string; uses: number; tokensSpent: number }>;
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/revenue')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8"><div className="shimmer rounded-2xl h-48" /></div>
      </DashboardLayout>
    );
  }

  if (!data?.overview) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-400">Admin access required or no data available.</div>
      </DashboardLayout>
    );
  }

  const { overview, topTools } = data;

  const cards = [
    { label: 'Total Users', value: overview.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-400' },
    { label: 'New Users (30d)', value: overview.recentSignups.toLocaleString(), icon: TrendingUp, color: 'text-green-400' },
    { label: 'Token Purchases', value: overview.tokensPurchased.toLocaleString(), icon: Coins, color: 'text-yellow-400' },
    { label: 'Ad Revenue', value: `$${((overview.adRevenue ?? 0) / 100).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Total Ad Views', value: overview.totalAdViews.toLocaleString(), icon: Eye, color: 'text-purple-400' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Platform monetization & growth metrics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-gray-400 mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" /> Top Tools by Usage
          </h3>
          {topTools.length === 0 ? (
            <p className="text-sm text-gray-400">No usage data yet.</p>
          ) : (
            <div className="space-y-3">
              {topTools.map((t, i) => (
                <div key={t.tool} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-6">{i + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{t.tool}</span>
                      <span className="text-xs text-gray-400">{t.uses} uses • {t.tokensSpent} tokens</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${Math.min(100, (t.uses / (topTools[0]?.uses || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
