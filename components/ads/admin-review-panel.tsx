"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye, Clock, DollarSign, Loader2 } from "lucide-react";

interface PendingAd {
  id: string;
  title: string;
  description: string;
  adType: string;
  adUrl: string | null;
  duration: number;
  targetApps: string[];
  cost: number;
  tokensPerView: number;
  createdAt: string;
  advertiser: {
    email: string;
    companyName: string;
    phone: string | null;
  };
  adPayments: Array<{ amount: number; status: string }>;
}

export default function AdminReviewPanel() {
  const [ads, setAds] = useState<PendingAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [previewAd, setPreviewAd] = useState<PendingAd | null>(null);

  const fetchAds = () => {
    setLoading(true);
    fetch('/api/admin/ads/pending')
      .then(r => r.json())
      .then(data => { setAds(data.ads || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchAds(); }, []);

  const handleApprove = async (adId: string) => {
    setActionLoading(adId);
    await fetch('/api/admin/ads/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId }),
    });
    setActionLoading(null);
    fetchAds();
  };

  const handleReject = async (adId: string) => {
    setActionLoading(adId);
    await fetch('/api/admin/ads/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, reason: rejectReason[adId] || '' }),
    });
    setActionLoading(null);
    fetchAds();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--accent)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading pending ads...</p>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>All caught up!</h3>
        <p style={{ color: 'var(--text-secondary)' }}>No pending ads to review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{ads.length} ad(s) pending review</p>

      {ads.map(ad => (
        <div key={ad.id} className="rounded-xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{ad.title}</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {ad.advertiser.companyName} ({ad.advertiser.email})
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">
              {ad.adType} · {ad.duration}s
            </span>
          </div>

          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{ad.description}</p>

          <div className="flex flex-wrap gap-3 mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${(ad.cost / 100).toFixed(2)}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ad.createdAt).toLocaleDateString()}</span>
            <span>Targets: {ad.targetApps.join(', ')}</span>
            <span>{ad.tokensPerView} tokens/view</span>
          </div>

          {ad.adUrl && (
            <button
              onClick={() => setPreviewAd(previewAd?.id === ad.id ? null : ad)}
              className="text-sm flex items-center gap-1 mb-3 hover:underline" style={{ color: 'var(--accent)' }}
            >
              <Eye className="w-4 h-4" /> {previewAd?.id === ad.id ? 'Hide' : 'Preview'}
            </button>
          )}

          {previewAd?.id === ad.id && ad.adUrl && (
            <div className="rounded-lg overflow-hidden mb-3" style={{ background: 'var(--bg-primary)' }}>
              {ad.adType === 'VIDEO' ? (
                <video src={ad.adUrl} controls className="w-full max-h-64" />
              ) : ad.adType === 'IMAGE' ? (
                <img src={ad.adUrl} alt={ad.title} className="w-full max-h-64 object-contain" />
              ) : null}
            </div>
          )}

          <div className="flex gap-3 items-center">
            <button
              onClick={() => handleApprove(ad.id)}
              disabled={actionLoading === ad.id}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-50"
            >
              {actionLoading === ad.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve
            </button>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Rejection reason..."
                value={rejectReason[ad.id] || ''}
                onChange={e => setRejectReason(r => ({ ...r, [ad.id]: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
              <button
                onClick={() => handleReject(ad.id)}
                disabled={actionLoading === ad.id}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
