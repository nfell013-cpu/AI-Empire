"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Megaphone, CheckCircle, TrendingUp, Users, Zap, DollarSign } from "lucide-react";
import AdvertiserUploadForm from "@/components/ads/advertiser-upload-form";

function AdvertiseContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="p-4 rounded-2xl mx-auto w-fit mb-4" style={{ background: 'rgba(99,102,241,0.2)' }}>
            <Megaphone className="w-10 h-10" style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Advertise on <span className="text-gradient">AI Empire</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Reach thousands of engaged users across 15 AI-powered tools.
          </p>
        </div>

        {/* Success/Cancel messages */}
        {success && (
          <div className="rounded-xl p-6 mb-8 text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <h3 className="text-xl font-bold text-green-400 mb-2">Payment Successful!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Your ad has been submitted for review. You&apos;ll be notified once it&apos;s approved.</p>
          </div>
        )}

        {canceled && (
          <div className="rounded-xl p-6 mb-8 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <p className="text-red-400 font-semibold">Payment was canceled. You can try again below.</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Daily Users', value: '1,200+', icon: Users, color: '#6366f1' },
            { label: 'AI Tools', value: '15', icon: Zap, color: '#10b981' },
            { label: 'Avg. Engagement', value: '89%', icon: TrendingUp, color: '#f59e0b' },
            { label: 'Starting From', value: '$25', icon: DollarSign, color: '#a855f7' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
              <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Upload Form */}
        {!success && <AdvertiserUploadForm />}
      </div>
    </div>
  );
}

export default function AdvertisePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}><p style={{ color: 'var(--text-secondary)' }}>Loading...</p></div>}>
      <AdvertiseContent />
    </Suspense>
  );
}
