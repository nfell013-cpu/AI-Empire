// Enhancement #22: Testimonials Section
"use client";

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Sarah Chen', role: 'Software Engineer', company: 'TechCorp',
    text: 'CodeAudit has saved our team hours of manual code review. The security scanning catches vulnerabilities we would have missed.',
    rating: 5, avatar: 'SC',
  },
  {
    name: 'Marcus Johnson', role: 'Marketing Director', company: 'GrowthLabs',
    text: 'AdCopy and SEOMaster are game-changers. Our ad conversion rates have increased 40% since we started using AI Empire.',
    rating: 5, avatar: 'MJ',
  },
  {
    name: 'Emily Rodriguez', role: 'Freelance Writer', company: 'Self-employed',
    text: 'WriteFlow helps me produce 3x more content without sacrificing quality. The token system is fair and affordable.',
    rating: 5, avatar: 'ER',
  },
  {
    name: 'David Kim', role: 'Financial Analyst', company: 'WealthPro',
    text: 'StockSense and TrendPulse provide insights that complement my own analysis. Great for quick market sentiment checks.',
    rating: 4, avatar: 'DK',
  },
  {
    name: 'Lisa Thompson', role: 'Small Business Owner', company: 'Bloom & Co',
    text: 'From InvoicePro to BrandSpark, AI Empire has become our one-stop shop for business tools. The referral program is a nice bonus!',
    rating: 5, avatar: 'LT',
  },
  {
    name: 'James Park', role: 'Student', company: 'MIT',
    text: 'StudyBlitz and LexiLearn have completely changed how I study. I can earn tokens by watching ads and use them for exam prep.',
    rating: 5, avatar: 'JP',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const t = TESTIMONIALS[current];

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gradient mb-3">What Our Users Say</h2>
        <p className="text-sm mb-12" style={{ color: 'var(--text-secondary)' }}>Join thousands of professionals using AI Empire daily</p>

        <div className="relative rounded-2xl p-8 mx-auto max-w-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Quote className="w-8 h-8 mb-4 mx-auto" style={{ color: 'var(--accent)', opacity: 0.3 }} />
          <p className="text-lg mb-6 leading-relaxed" style={{ color: 'var(--text-primary)' }}>&ldquo;{t.text}&rdquo;</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--accent-light)' }}>
              {t.avatar}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.role} at {t.company}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 mt-4">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setCurrent(c => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              className="p-1.5 rounded-lg" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === current ? 'var(--accent)' : 'var(--border)' }} />
            ))}
            <button onClick={() => setCurrent(c => (c + 1) % TESTIMONIALS.length)}
              className="p-1.5 rounded-lg" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
