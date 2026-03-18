"use client";

import { useState, useEffect } from "react";
import { Upload, DollarSign, Zap, ArrowRight, CheckCircle, Loader2 } from "lucide-react";

interface PricingData {
  pricing: {
    basePriceCents: number;
    durationCostCents: number;
    placementMultiplier: number;
    typeMultiplier: number;
    totalCents: number;
    totalDollars: string;
    perImpressionEstimate: string;
    recommendations: string[];
  };
  tokensPerView: number;
  rewardTier: string;
  suggestedTiers: Array<{
    name: string;
    duration: number;
    adType: string;
    targetApps: string[];
    estimatedCost: string;
    description: string;
  }>;
}

const APP_OPTIONS = [
  { slug: 'all', name: 'All Apps (15 tools)' },
  { slug: 'legalese', name: 'Legalese - PDF Scanner' },
  { slug: 'flipscore', name: 'FlipScore - Thrift Scanner' },
  { slug: 'tradeace', name: 'TradeAce - Exam Prep' },
  { slug: 'dealdone', name: 'DealDone - Negotiation AI' },
  { slug: 'leafcheck', name: 'LeafCheck - Plant ID' },
  { slug: 'pawpair', name: 'PawPair - Pet Quiz' },
  { slug: 'visionlens', name: 'VisionLens - Object ID' },
  { slug: 'coachlogic', name: 'CoachLogic - Practice Plans' },
  { slug: 'globeguide', name: 'GlobeGuide - Travel AI' },
  { slug: 'skillscope', name: 'SkillScope - Resume Analyzer' },
  { slug: 'datavault', name: 'DataVault - Finance' },
  { slug: 'guardianai', name: 'GuardianAI - Reputation' },
  { slug: 'trendpulse', name: 'TrendPulse - Market Predictor' },
  { slug: 'soundforge', name: 'SoundForge - Music Generator' },
  { slug: 'mememint', name: 'MemeMint - Meme Generator' },
];

export default function AdvertiserUploadForm() {
  const [form, setForm] = useState({
    email: '',
    companyName: '',
    phone: '',
    title: '',
    description: '',
    adType: 'IMAGE' as 'VIDEO' | 'IMAGE' | 'TEXT',
    adUrl: '',
    duration: 30,
    targetApps: ['all'] as string[],
  });
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pricing whenever duration, targetApps, or adType changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch('/api/ads/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration: form.duration,
          targetApps: form.targetApps,
          adType: form.adType,
        }),
      })
        .then(r => r.json())
        .then(setPricing)
        .catch(console.error);
    }, 300);
    return () => clearTimeout(timer);
  }, [form.duration, form.targetApps, form.adType]);

  const handleTargetChange = (slug: string) => {
    if (slug === 'all') {
      setForm(f => ({ ...f, targetApps: f.targetApps.includes('all') ? [] : ['all'] }));
    } else {
      setForm(f => {
        const apps = f.targetApps.filter(a => a !== 'all');
        return {
          ...f,
          targetApps: apps.includes(slug) ? apps.filter(a => a !== slug) : [...apps, slug],
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/ads/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit ad');
        setSubmitting(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Something went wrong');
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Ad Submitted!</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Your ad will be reviewed by our team within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Info */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="email"
            placeholder="Business Email *"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
          <input
            type="text"
            placeholder="Company Name *"
            value={form.companyName}
            onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Ad Details */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Ad Details</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Ad Title *"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
          <textarea
            placeholder="Ad Description *"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            required
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm resize-none" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />

          <div className="grid grid-cols-3 gap-3">
            {(['VIDEO', 'IMAGE', 'TEXT'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setForm(f => ({ ...f, adType: type }))}
                className="py-3 rounded-xl text-sm font-semibold transition"
                style={{
                  background: form.adType === type ? 'var(--accent)' : 'var(--bg-primary)',
                  color: form.adType === type ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${form.adType === type ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {form.adType !== 'TEXT' && (
            <input
              type="url"
              placeholder={`${form.adType === 'VIDEO' ? 'Video' : 'Image'} URL`}
              value={form.adUrl}
              onChange={e => setForm(f => ({ ...f, adUrl: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          )}

          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Duration: {form.duration} seconds
            </label>
            <input
              type="range"
              min={5}
              max={120}
              value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              <span>5s</span><span>30s</span><span>60s</span><span>120s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Apps */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Target Apps</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {APP_OPTIONS.map(app => (
            <button
              key={app.slug}
              type="button"
              onClick={() => handleTargetChange(app.slug)}
              className="px-3 py-2 rounded-lg text-xs font-medium transition text-left"
              style={{
                background: form.targetApps.includes(app.slug) ? 'rgba(99,102,241,0.2)' : 'var(--bg-primary)',
                color: form.targetApps.includes(app.slug) ? 'var(--accent-light)' : 'var(--text-secondary)',
                border: `1px solid ${form.targetApps.includes(app.slug) ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {app.name}
            </button>
          ))}
        </div>
      </div>

      {/* AI Pricing */}
      {pricing && (
        <div className="rounded-xl p-6" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', border: '1px solid var(--accent)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>AI Pricing Estimate</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Cost</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--accent-light)' }}>${pricing.pricing.totalDollars}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Tokens Per View</p>
              <p className="text-2xl font-bold text-yellow-400">{pricing.tokensPerView}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Est. CPM</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>${pricing.pricing.perImpressionEstimate}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Reward Tier</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{pricing.rewardTier}</p>
            </div>
          </div>

          {pricing.pricing.recommendations.length > 0 && (
            <div className="space-y-2">
              {pricing.pricing.recommendations.map((rec, i) => (
                <p key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rec}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, var(--accent), #a855f7)' }}
      >
        {submitting ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
        ) : (
          <><DollarSign className="w-5 h-5" /> Pay & Submit Ad <ArrowRight className="w-5 h-5" /></>
        )}
      </button>
    </form>
  );
}
