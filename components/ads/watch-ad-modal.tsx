"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Play, CheckCircle, Clock, Coins } from "lucide-react";

interface AdData {
  id: string;
  title: string;
  description: string;
  adType: string;
  adUrl: string | null;
  duration: number;
  tokensPerView: number;
}

interface WatchAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokensEarned?: (tokens: number) => void;
}

export default function WatchAdModal({ isOpen, onClose, onTokensEarned }: WatchAdModalProps) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [tokensEarned, setTokensEarned] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setCompleted(false);
      setWatching(false);
      setElapsed(0);
      setError(null);
      fetch('/api/ads/serve')
        .then(r => r.json())
        .then(data => {
          setAd(data.ad);
          setLoading(false);
          if (!data.ad) setError('No ads available right now. Check back later!');
        })
        .catch(() => {
          setLoading(false);
          setError('Failed to load ad');
        });
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  const startWatching = useCallback(() => {
    setWatching(true);
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    if (watching && ad && elapsed >= ad.duration) {
      if (timerRef.current) clearInterval(timerRef.current);
      // Submit view
      fetch('/api/ads/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id, watchDuration: elapsed }),
      })
        .then(r => r.json())
        .then(data => {
          setCompleted(true);
          setWatching(false);
          if (data.tokensEarned) {
            setTokensEarned(data.tokensEarned);
            onTokensEarned?.(data.tokensEarned);
          }
        })
        .catch(() => setError('Failed to record view'));
    }
  }, [elapsed, watching, ad, onTokensEarned]);

  if (!isOpen) return null;

  const progress = ad ? Math.min((elapsed / ad.duration) * 100, 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        {/* Close button - only if not actively watching */}
        {!watching && (
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading ad...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-yellow-400 mb-4">{error}</p>
            <button onClick={onClose} className="px-4 py-2 rounded-lg" style={{ background: 'var(--accent)' }}>Close</button>
          </div>
        )}

        {completed && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Tokens Earned!</h3>
            <div className="flex items-center justify-center gap-2 text-3xl font-bold text-yellow-400 mb-4">
              <Coins className="w-8 h-8" />
              +{tokensEarned}
            </div>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Thanks for watching! Your tokens have been credited.</p>
            <button onClick={onClose} className="px-6 py-3 rounded-xl font-semibold text-white" style={{ background: 'var(--accent)' }}>
              Done
            </button>
          </div>
        )}

        {ad && !loading && !error && !completed && (
          <>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Earn {ad.tokensPerView} tokens</span>
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{ad.title}</h3>
            </div>

            {/* Ad content area */}
            <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--bg-primary)', minHeight: '200px' }}>
              {ad.adType === 'VIDEO' && ad.adUrl && (
                <video
                  src={ad.adUrl}
                  className="w-full"
                  autoPlay={watching}
                  controls={false}
                  muted={false}
                />
              )}
              {ad.adType === 'IMAGE' && ad.adUrl && (
                <img src={ad.adUrl} alt={ad.title} className="w-full h-auto" />
              )}
              {(ad.adType === 'TEXT' || !ad.adUrl) && (
                <div className="p-8 text-center">
                  <h4 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{ad.title}</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{ad.description}</p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {watching && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{elapsed}s / {ad.duration}s</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
                </div>
              </div>
            )}

            {!watching && (
              <button
                onClick={startWatching}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--accent), #a855f7)' }}
              >
                <Play className="w-5 h-5" />
                Watch Ad ({ad.duration}s) to Earn {ad.tokensPerView} Tokens
              </button>
            )}

            {watching && (
              <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                Please watch the full ad to earn your tokens...
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
