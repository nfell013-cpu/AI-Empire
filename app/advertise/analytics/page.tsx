'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Eye, MousePointer, DollarSign, TrendingUp, Target, Calculator } from 'lucide-react';
import StatCard from '@/components/analytics/stat-card';
import LineChart from '@/components/analytics/line-chart';
import BarChart from '@/components/analytics/bar-chart';
import DataTable from '@/components/analytics/data-table';
import LoadingSkeleton from '@/components/analytics/loading-skeleton';

interface AdPerformance {
  id: string;
  title: string;
  status: string;
  adType: string;
  impressions: number;
  clicks: number;
  ctr: string;
  cost: string;
  views: number;
  createdAt: string;
}

interface AnalyticsData {
  overview: {
    totalAds: number;
    activeAds: number;
    totalSpent: string;
    totalImpressions: number;
    totalClicks: number;
    avgCTR: string;
  };
  adPerformance: AdPerformance[];
  dailyTimeSeries: Array<{ date: string; impressions: number; clicks: number }>;
  performanceByType: Array<{ type: string; impressions: number; clicks: number; count: number }>;
  topByImpressions: AdPerformance[];
  topByCTR: AdPerformance[];
}

export default function AdvertiserAnalyticsPage() {
  const [email, setEmail] = useState('');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ROI Calculator
  const [roiCost, setRoiCost] = useState('100');
  const [roiConversion, setRoiConversion] = useState('2.5');

  const fetchAnalytics = async () => {
    if (!email) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/analytics/advertiser?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const filteredAds = data?.adPerformance?.filter(
    (ad) => statusFilter === 'all' || ad.status === statusFilter
  ) || [];

  const roiResult = (() => {
    const cost = parseFloat(roiCost) || 0;
    const rate = parseFloat(roiConversion) || 0;
    const projectedConversions = (data?.overview?.totalImpressions || 1000) * (rate / 100);
    const projectedRevenue = projectedConversions * 50; // Assume $50 per conversion
    const roi = cost > 0 ? ((projectedRevenue - cost) / cost * 100).toFixed(1) : '0';
    return { projectedConversions: Math.round(projectedConversions), projectedRevenue: projectedRevenue.toFixed(2), roi };
  })();

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h3 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
        📈 Advertiser Analytics
      </h3>

      {/* Email Input */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <input
          type="email"
          placeholder="Enter advertiser email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchAnalytics()}
          style={{
            flex: 1,
            minWidth: '250px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '10px 16px',
            color: '#f1f5f9',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          onClick={fetchAnalytics}
          disabled={loading || !email}
          style={{
            background: loading ? '#334155' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 24px',
            cursor: loading || !email ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Loading...' : 'View Analytics'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {loading && <LoadingSkeleton rows={6} />}

      {data && !loading && (
        <>
          {/* Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard title="Total Ads" value={data.overview.totalAds} icon={<BarChart3 size={22} />} color="blue" />
            <StatCard title="Active Ads" value={data.overview.activeAds} icon={<Target size={22} />} color="green" />
            <StatCard title="Total Spent" value={`$${data.overview.totalSpent}`} icon={<DollarSign size={22} />} color="purple" />
            <StatCard title="Impressions" value={data.overview.totalImpressions.toLocaleString()} icon={<Eye size={22} />} color="orange" />
            <StatCard title="Clicks" value={data.overview.totalClicks.toLocaleString()} icon={<MousePointer size={22} />} color="yellow" />
            <StatCard title="Avg CTR" value={`${data.overview.avgCTR}%`} icon={<TrendingUp size={22} />} color="green" />
          </div>

          {/* Performance Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <LineChart
              title="Impressions & Clicks (Last 30 Days)"
              data={data.dailyTimeSeries}
              xKey="date"
              lines={[
                { key: 'impressions', color: '#3b82f6', name: 'Impressions' },
                { key: 'clicks', color: '#10b981', name: 'Clicks' },
              ]}
            />
            <BarChart
              title="Performance by Ad Type"
              data={data.performanceByType}
              xKey="type"
              bars={[
                { key: 'impressions', color: '#3b82f6', name: 'Impressions' },
                { key: 'clicks', color: '#10b981', name: 'Clicks' },
              ]}
            />
          </div>

          {/* Top Performers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <h4 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                🏆 Top by Impressions
              </h4>
              {data.topByImpressions.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px' }}>No ads yet</p>
              ) : (
                data.topByImpressions.map((ad, i) => (
                  <div key={ad.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px', borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
                  }}>
                    <div>
                      <span style={{ color: '#f97316', fontWeight: 700, marginRight: '8px' }}>#{i + 1}</span>
                      <span style={{ color: '#e2e8f0', fontSize: '14px' }}>{ad.title}</span>
                    </div>
                    <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: '13px' }}>
                      {ad.impressions.toLocaleString()} views
                    </span>
                  </div>
                ))
              )}
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <h4 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                🎯 Top by CTR
              </h4>
              {data.topByCTR.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px' }}>No ads yet</p>
              ) : (
                data.topByCTR.map((ad, i) => (
                  <div key={ad.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px', borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
                  }}>
                    <div>
                      <span style={{ color: '#f97316', fontWeight: 700, marginRight: '8px' }}>#{i + 1}</span>
                      <span style={{ color: '#e2e8f0', fontSize: '14px' }}>{ad.title}</span>
                    </div>
                    <span style={{ color: '#10b981', fontWeight: 600, fontSize: '13px' }}>
                      {ad.ctr}% CTR
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ad Performance Table */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {['all', 'ACTIVE', 'PAUSED', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    background: statusFilter === s ? '#10b981' : '#1e293b',
                    color: statusFilter === s ? 'white' : '#94a3b8',
                    border: '1px solid ' + (statusFilter === s ? '#10b981' : '#334155'),
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
            <DataTable
              title="Ad Performance"
              columns={[
                { key: 'title', label: 'Title' },
                {
                  key: 'status', label: 'Status',
                  render: (val: string) => (
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                      background: val === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : val === 'PENDING' ? 'rgba(234, 179, 8, 0.15)' : val === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: val === 'ACTIVE' ? '#10b981' : val === 'PENDING' ? '#eab308' : val === 'REJECTED' ? '#ef4444' : '#3b82f6',
                    }}>
                      {val}
                    </span>
                  ),
                },
                { key: 'adType', label: 'Type' },
                { key: 'impressions', label: 'Impressions', sortable: true },
                { key: 'clicks', label: 'Clicks', sortable: true },
                { key: 'ctr', label: 'CTR %', sortable: true },
                { key: 'cost', label: 'Cost ($)', sortable: true },
              ]}
              data={filteredAds}
            />
          </div>

          {/* ROI Calculator */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <h4 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={20} style={{ color: '#8b5cf6' }} />
              ROI Calculator
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Ad Cost ($)</label>
                <input
                  type="number"
                  value={roiCost}
                  onChange={(e) => setRoiCost(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155',
                    borderRadius: '8px', padding: '8px 12px', color: '#f1f5f9', fontSize: '14px', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Est. Conversion Rate (%)</label>
                <input
                  type="number"
                  value={roiConversion}
                  onChange={(e) => setRoiConversion(e.target.value)}
                  step="0.1"
                  style={{
                    width: '100%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155',
                    borderRadius: '8px', padding: '8px 12px', color: '#f1f5f9', fontSize: '14px', outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px' }}>
                <p style={{ color: '#8b5cf6', fontSize: '22px', fontWeight: 700 }}>{roiResult.projectedConversions}</p>
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>Projected Conversions</p>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px' }}>
                <p style={{ color: '#10b981', fontSize: '22px', fontWeight: 700 }}>${roiResult.projectedRevenue}</p>
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>Projected Revenue</p>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px' }}>
                <p style={{ color: parseFloat(roiResult.roi) >= 0 ? '#10b981' : '#ef4444', fontSize: '22px', fontWeight: 700 }}>{roiResult.roi}%</p>
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>Projected ROI</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
