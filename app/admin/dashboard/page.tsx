'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign, Users, TrendingUp, Coins, BarChart3, Eye,
  AlertCircle, Clock, CheckCircle, XCircle, Activity, Zap, Shield,
} from 'lucide-react';
import StatCard from '@/components/analytics/stat-card';
import LineChart from '@/components/analytics/line-chart';
import BarChart from '@/components/analytics/bar-chart';
import PieChart from '@/components/analytics/pie-chart';
import DataTable from '@/components/analytics/data-table';
import LoadingSkeleton from '@/components/analytics/loading-skeleton';

interface AdminData {
  revenue: {
    total: number;
    thisMonth: number;
    thisWeek: number;
    today: number;
    tokenSales: number;
    adRevenue: number;
  };
  revenueOverTime: Array<{ date: string; revenue: number }>;
  revenueBySource: Array<{ name: string; value: number }>;
  users: {
    total: number;
    activeThisWeek: number;
    newThisMonth: number;
    churnRate: string;
  };
  dailyActiveUsers: Array<{ date: string; users: number }>;
  signupsOverTime: Array<{ month: string; signups: number }>;
  tokenEconomy: {
    totalIssued: number;
    totalConsumed: number;
    avgPerUser: number;
    velocityPerDay: number;
  };
  adSystem: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    active: number;
    totalAdRevenue: number;
  };
  toolPopularity: Array<{ tool: string; usage: number; revenue: number }>;
  recentActivity: {
    signups: Array<{ id: string; email: string; firstName: string | null; createdAt: string }>;
    purchases: Array<{ id: string; userId: string; packageId: string; tokenAmount: number; priceInCents: number; status: string; createdAt: string }>;
    adSubmissions: Array<{ id: string; title: string; status: string; advertiser: string; createdAt: string }>;
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tokens' | 'ads' | 'tools'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics/admin');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch');
      }
      setData(await res.json());
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <h3 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
          🛡️ Admin Dashboard
        </h3>
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <AlertCircle size={32} style={{ color: '#ef4444', marginBottom: '8px' }} />
          <p style={{ color: '#ef4444', marginBottom: '12px' }}>{error || 'Access denied or no data'}</p>
          <button onClick={fetchData} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: BarChart3 },
    { id: 'users', label: '👥 Users', icon: Users },
    { id: 'tokens', label: '🪙 Tokens', icon: Coins },
    { id: 'ads', label: '📺 Ads', icon: Eye },
    { id: 'tools', label: '🛠 Tools', icon: Zap },
  ] as const;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 700 }}>
          🛡️ Admin Super Dashboard
        </h3>
        <button
          onClick={fetchData}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 16px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
              border: `1px solid ${activeTab === tab.id ? '#10b981' : '#334155'}`,
              borderRadius: '8px',
              padding: '8px 16px',
              color: activeTab === tab.id ? '#10b981' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* Revenue Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard title="Total Revenue" value={`$${data.revenue.total.toFixed(2)}`} icon={<DollarSign size={22} />} color="green" />
            <StatCard title="This Month" value={`$${data.revenue.thisMonth.toFixed(2)}`} icon={<TrendingUp size={22} />} color="blue" />
            <StatCard title="This Week" value={`$${data.revenue.thisWeek.toFixed(2)}`} icon={<Activity size={22} />} color="purple" />
            <StatCard title="Today" value={`$${data.revenue.today.toFixed(2)}`} icon={<Clock size={22} />} color="orange" />
            <StatCard title="Token Sales" value={`$${data.revenue.tokenSales.toFixed(2)}`} subtitle="from token packages" icon={<Coins size={22} />} color="yellow" />
            <StatCard title="Ad Revenue" value={`$${data.revenue.adRevenue.toFixed(2)}`} subtitle="from advertisers" icon={<Eye size={22} />} color="purple" />
          </div>

          {/* Revenue Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <LineChart
              title="Revenue Over Time (Last 90 Days)"
              data={data.revenueOverTime}
              xKey="date"
              lines={[{ key: 'revenue', color: '#10b981', name: 'Revenue ($)' }]}
            />
            {data.revenueBySource.some((s) => s.value > 0) ? (
              <PieChart title="Revenue by Source" data={data.revenueBySource} />
            ) : (
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <DollarSign size={40} style={{ color: '#334155', marginBottom: '12px' }} />
                <p style={{ color: '#64748b' }}>No revenue data yet</p>
                <p style={{ color: '#475569', fontSize: '13px' }}>Revenue breakdown will appear here</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h4 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              🔔 Recent Activity Feed
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {/* Recent Signups */}
              <div>
                <h5 style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Latest Signups</h5>
                {data.recentActivity.signups.map((u) => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                    <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{u.firstName || u.email}</span>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
              {/* Recent Purchases */}
              <div>
                <h5 style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Latest Purchases</h5>
                {data.recentActivity.purchases.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                    <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{p.packageId} ({p.tokenAmount} tokens)</span>
                    <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600 }}>${(p.priceInCents / 100).toFixed(2)}</span>
                  </div>
                ))}
                {data.recentActivity.purchases.length === 0 && <p style={{ color: '#64748b', fontSize: '13px' }}>No recent purchases</p>}
              </div>
              {/* Recent Ad Submissions */}
              <div>
                <h5 style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Latest Ad Submissions</h5>
                {data.recentActivity.adSubmissions.map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                    <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{a.title}</span>
                    <span style={{
                      padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                      background: a.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : a.status === 'PENDING' ? 'rgba(234,179,8,0.15)' : 'rgba(59,130,246,0.15)',
                      color: a.status === 'ACTIVE' ? '#10b981' : a.status === 'PENDING' ? '#eab308' : '#3b82f6',
                    }}>
                      {a.status}
                    </span>
                  </div>
                ))}
                {data.recentActivity.adSubmissions.length === 0 && <p style={{ color: '#64748b', fontSize: '13px' }}>No ad submissions</p>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard title="Total Users" value={data.users.total.toLocaleString()} icon={<Users size={22} />} color="blue" />
            <StatCard title="Active (7 Days)" value={data.users.activeThisWeek.toLocaleString()} icon={<Activity size={22} />} color="green" />
            <StatCard title="New This Month" value={data.users.newThisMonth.toLocaleString()} icon={<TrendingUp size={22} />} color="purple" />
            <StatCard title="Churn Rate" value={`${data.users.churnRate}%`} icon={<AlertCircle size={22} />} color="red" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <LineChart
              title="Daily Active Users (Last 30 Days)"
              data={data.dailyActiveUsers}
              xKey="date"
              lines={[{ key: 'users', color: '#3b82f6', name: 'Active Users' }]}
            />
            <BarChart
              title="User Signups Over Time"
              data={data.signupsOverTime}
              xKey="month"
              bars={[{ key: 'signups', color: '#8b5cf6', name: 'New Signups' }]}
            />
          </div>

          {/* User engagement levels */}
          <PieChart
            title="User Activity Levels"
            data={[
              { name: 'High (Active this week)', value: data.users.activeThisWeek },
              { name: 'Medium', value: Math.max(0, data.users.newThisMonth - data.users.activeThisWeek) },
              { name: 'Low (Inactive)', value: Math.max(0, data.users.total - data.users.newThisMonth) },
            ]}
            height={280}
          />
        </>
      )}

      {/* TOKENS TAB */}
      {activeTab === 'tokens' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard title="Total Issued" value={data.tokenEconomy.totalIssued.toLocaleString()} subtitle="purchased + earned" icon={<Coins size={22} />} color="green" />
            <StatCard title="Total Consumed" value={data.tokenEconomy.totalConsumed.toLocaleString()} icon={<Zap size={22} />} color="orange" />
            <StatCard title="Avg per User" value={data.tokenEconomy.avgPerUser.toLocaleString()} icon={<Users size={22} />} color="blue" />
            <StatCard title="Velocity/Day" value={data.tokenEconomy.velocityPerDay.toLocaleString()} subtitle="tokens spent per day" icon={<Activity size={22} />} color="purple" />
          </div>

          {/* Token economy health visualization */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h4 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
              🪙 Token Economy Health
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Circulation Rate</p>
                <div style={{ background: '#1e293b', borderRadius: '8px', height: '20px', overflow: 'hidden' }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                    height: '100%',
                    width: `${Math.min(100, data.tokenEconomy.totalIssued > 0 ? (data.tokenEconomy.totalConsumed / data.tokenEconomy.totalIssued * 100) : 0)}%`,
                    borderRadius: '8px',
                    transition: 'width 1s ease',
                  }} />
                </div>
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                  {data.tokenEconomy.totalIssued > 0
                    ? `${(data.tokenEconomy.totalConsumed / data.tokenEconomy.totalIssued * 100).toFixed(1)}% of issued tokens consumed`
                    : 'No tokens issued yet'}
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '12px 24px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px' }}>
                <p style={{ color: '#10b981', fontSize: '32px', fontWeight: 700 }}>
                  {data.tokenEconomy.totalIssued - data.tokenEconomy.totalConsumed >= 0 ? '✅' : '⚠️'}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>
                  {(data.tokenEconomy.totalIssued - data.tokenEconomy.totalConsumed).toLocaleString()} tokens in circulation
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ADS TAB */}
      {activeTab === 'ads' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard title="Total Ads" value={data.adSystem.total} icon={<BarChart3 size={22} />} color="blue" />
            <StatCard title="Pending Review" value={data.adSystem.pending} icon={<Clock size={22} />} color="yellow" />
            <StatCard title="Approved" value={data.adSystem.approved} icon={<CheckCircle size={22} />} color="green" />
            <StatCard title="Active" value={data.adSystem.active} icon={<Eye size={22} />} color="green" />
            <StatCard title="Rejected" value={data.adSystem.rejected} icon={<XCircle size={22} />} color="red" />
            <StatCard title="Ad Revenue" value={`$${data.adSystem.totalAdRevenue.toFixed(2)}`} icon={<DollarSign size={22} />} color="purple" />
          </div>

          {/* Ad pipeline visualization */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h4 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
              📊 Ad Pipeline
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { label: 'Submitted', value: data.adSystem.total, color: '#3b82f6' },
                { label: 'Pending', value: data.adSystem.pending, color: '#eab308' },
                { label: 'Approved', value: data.adSystem.approved, color: '#10b981' },
                { label: 'Active', value: data.adSystem.active, color: '#06b6d4' },
                { label: 'Rejected', value: data.adSystem.rejected, color: '#ef4444' },
              ].map((step) => (
                <div key={step.label} style={{ textAlign: 'center', flex: '1', minWidth: '100px' }}>
                  <div style={{
                    background: `${step.color}22`,
                    border: `2px solid ${step.color}`,
                    borderRadius: '12px',
                    padding: '16px 8px',
                    marginBottom: '8px',
                  }}>
                    <p style={{ color: step.color, fontSize: '28px', fontWeight: 700 }}>{step.value}</p>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 500 }}>{step.label}</p>
                </div>
              ))}
            </div>
          </div>

          <PieChart
            title="Ad Status Distribution"
            data={[
              { name: 'Active', value: data.adSystem.active },
              { name: 'Pending', value: data.adSystem.pending },
              { name: 'Approved (not active)', value: Math.max(0, data.adSystem.approved - data.adSystem.active) },
              { name: 'Rejected', value: data.adSystem.rejected },
            ].filter((d) => d.value > 0)}
            colors={['#10b981', '#eab308', '#3b82f6', '#ef4444']}
            height={280}
          />
        </>
      )}

      {/* TOOLS TAB */}
      {activeTab === 'tools' && (
        <>
          {data.toolPopularity.length > 0 ? (
            <>
              <BarChart
                title="Most Used Tools"
                data={data.toolPopularity.slice(0, 20)}
                xKey="tool"
                bars={[
                  { key: 'usage', color: '#3b82f6', name: 'Usage Count' },
                ]}
                height={400}
              />
              <div style={{ marginTop: '24px' }}>
                <DataTable
                  title="Tool Usage Statistics"
                  columns={[
                    { key: 'tool', label: 'Tool' },
                    { key: 'usage', label: 'Total Uses', sortable: true },
                    { key: 'revenue', label: 'Tokens Generated', sortable: true },
                  ]}
                  data={data.toolPopularity}
                />
              </div>
            </>
          ) : (
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
            }}>
              <Zap size={48} style={{ color: '#334155', marginBottom: '12px' }} />
              <p style={{ color: '#64748b', fontSize: '16px' }}>No tool usage data yet</p>
              <p style={{ color: '#475569', fontSize: '13px' }}>Tool statistics will appear as users interact with the platform</p>
            </div>
          )}
        </>
      )}

      {/* System Health */}
      {activeTab === 'overview' && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '24px',
        }}>
          <h4 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} style={{ color: '#10b981' }} />
            System Health
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>API Status</p>
              <p style={{ color: '#10b981', fontSize: '16px', fontWeight: 600 }}>✅ Operational</p>
            </div>
            <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Database</p>
              <p style={{ color: '#10b981', fontSize: '16px', fontWeight: 600 }}>✅ Connected</p>
            </div>
            <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Active Users</p>
              <p style={{ color: '#3b82f6', fontSize: '16px', fontWeight: 600 }}>{data.users.activeThisWeek} this week</p>
            </div>
            <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Pending Reviews</p>
              <p style={{ color: data.adSystem.pending > 0 ? '#eab308' : '#10b981', fontSize: '16px', fontWeight: 600 }}>
                {data.adSystem.pending > 0 ? `⚠️ ${data.adSystem.pending} pending` : '✅ All clear'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
