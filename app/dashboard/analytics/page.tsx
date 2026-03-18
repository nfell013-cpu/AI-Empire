'use client';

import { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, Eye, BarChart3, Clock, Zap } from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import StatCard from '@/components/analytics/stat-card';
import LineChart from '@/components/analytics/line-chart';
import BarChart from '@/components/analytics/bar-chart';
import PieChart from '@/components/analytics/pie-chart';
import DataTable from '@/components/analytics/data-table';
import LoadingSkeleton from '@/components/analytics/loading-skeleton';

interface AnalyticsData {
  tokenOverview: {
    currentBalance: number;
    totalPurchased: number;
    totalEarnedFromAds: number;
    totalSpent: number;
  };
  balanceOverTime: Array<{ date: string; balance: number; spent: number }>;
  toolUsage: Array<{ tool: string; count: number; tokensSpent: number }>;
  adStats: {
    totalAdsWatched: number;
    totalTokensEarned: number;
    avgTokensPerAd: number;
  };
  recentTransactions: Array<{
    id: string;
    amount: number;
    balance: number;
    type: string;
    description: string;
    toolSlug: string | null;
    createdAt: string;
  }>;
}

export default function UserAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics/user');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const content = loading ? (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h3 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
        📊 Your Analytics
      </h3>
      <LoadingSkeleton rows={4} />
    </div>
  ) : (error || !data) ? (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: '12px' }}>{error || 'No data available'}</p>
        <button onClick={fetchAnalytics} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    </div>
  ) : null;

  if (content) return <DashboardLayout>{content}</DashboardLayout>;

  const { tokenOverview, balanceOverTime, toolUsage, adStats, recentTransactions } = data!;

  // Prepare pie chart data for top 10 tools
  const topTools = toolUsage.slice(0, 10).map((t) => ({
    name: t.tool,
    value: t.count,
  }));

  return (
    <DashboardLayout>
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 700 }}>
          📊 Your Analytics
        </h3>
        <button
          onClick={fetchAnalytics}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 16px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Token Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          title="Current Balance"
          value={tokenOverview.currentBalance.toLocaleString()}
          subtitle="tokens available"
          icon={<Coins size={22} />}
          color="green"
        />
        <StatCard
          title="Tokens Purchased"
          value={tokenOverview.totalPurchased.toLocaleString()}
          subtitle="total bought"
          icon={<TrendingUp size={22} />}
          color="blue"
        />
        <StatCard
          title="Tokens Earned (Ads)"
          value={tokenOverview.totalEarnedFromAds.toLocaleString()}
          subtitle="from watching ads"
          icon={<Eye size={22} />}
          color="purple"
        />
        <StatCard
          title="Tokens Spent"
          value={tokenOverview.totalSpent.toLocaleString()}
          subtitle="total used"
          icon={<TrendingDown size={22} />}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <LineChart
          title="Token Balance (Last 30 Days)"
          data={balanceOverTime}
          xKey="date"
          lines={[
            { key: 'balance', color: '#10b981', name: 'Balance' },
          ]}
        />
        <BarChart
          title="Daily Token Spending"
          data={balanceOverTime}
          xKey="date"
          bars={[
            { key: 'spent', color: '#f97316', name: 'Tokens Spent' },
          ]}
        />
      </div>

      {/* Tool Usage + Ad Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {topTools.length > 0 ? (
          <PieChart title="Most Used Tools (Top 10)" data={topTools} />
        ) : (
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            <Zap size={40} style={{ color: '#334155', marginBottom: '12px' }} />
            <p style={{ color: '#64748b' }}>No tool usage data yet</p>
            <p style={{ color: '#475569', fontSize: '13px' }}>Start using AI tools to see your analytics</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h4 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              📺 Ad Viewing Stats
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#8b5cf6', fontSize: '24px', fontWeight: 700 }}>{adStats.totalAdsWatched}</p>
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>Ads Watched</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#10b981', fontSize: '24px', fontWeight: 700 }}>{adStats.totalTokensEarned}</p>
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>Tokens Earned</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 700 }}>{adStats.avgTokensPerAd}</p>
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>Avg per Ad</p>
              </div>
            </div>
          </div>

          {/* Tool usage table */}
          {toolUsage.length > 0 && (
            <DataTable
              title="All Tool Usage"
              columns={[
                { key: 'tool', label: 'Tool' },
                { key: 'count', label: 'Uses', sortable: true },
                { key: 'tokensSpent', label: 'Tokens Spent', sortable: true },
              ]}
              data={toolUsage}
              pageSize={5}
            />
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <DataTable
        title="Recent Activity (Last 10)"
        columns={[
          {
            key: 'type',
            label: 'Type',
            render: (val: string) => (
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                background: val === 'usage' ? 'rgba(249, 115, 22, 0.15)' : val === 'purchase' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: val === 'usage' ? '#f97316' : val === 'purchase' ? '#3b82f6' : '#10b981',
              }}>
                {val}
              </span>
            ),
          },
          { key: 'description', label: 'Description' },
          {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            render: (val: number) => (
              <span style={{ color: val >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {val >= 0 ? '+' : ''}{val}
              </span>
            ),
          },
          { key: 'balance', label: 'Balance', sortable: true },
          {
            key: 'createdAt',
            label: 'Date',
            render: (val: string) => new Date(val).toLocaleDateString(),
          },
        ]}
        data={recentTransactions}
        pageSize={10}
      />
    </div>
    </DashboardLayout>
  );
}
