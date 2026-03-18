// Enhancement #20: Cookie Consent Banner (GDPR)
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (type: 'all' | 'essential') => {
    localStorage.setItem('cookie-consent', JSON.stringify({ type, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-4xl mx-auto rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Cookie className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Cookie Preferences</h3>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              We use cookies to enhance your experience, analyze traffic, and personalize content. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
              <Link href="/privacy" className="ml-1 hover:underline" style={{ color: 'var(--accent)' }}>Learn more</Link>
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => accept('all')} className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'var(--accent)' }}>
                Accept All
              </button>
              <button onClick={() => accept('essential')} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                Essential Only
              </button>
            </div>
          </div>
          <button onClick={() => setVisible(false)} className="p-1 rounded-lg hover:opacity-70 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
