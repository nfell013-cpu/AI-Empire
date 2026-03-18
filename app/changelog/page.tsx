export default function ChangelogPage() {
  const entries = [
    {
      version: "2.5.0",
      date: "March 18, 2026",
      tag: "Latest",
      changes: [
        "🌟 Daily login streaks with bonus tokens",
        "🎮 Gamification: ratings, reviews, and tool recommendations",
        "⌨️ Keyboard shortcuts (Cmd+/ for help)",
        "📊 Admin revenue dashboard",
        "🔔 Low token balance warnings",
        "📡 Webhook integrations for tool completions",
        "🟢 System status page",
        "📱 PWA install prompt & offline support",
      ],
    },
    {
      version: "2.0.0",
      date: "March 15, 2026",
      changes: [
        "🔒 Email verification, 2FA, password reset",
        "🌙 Dark/light mode toggle",
        "🔍 Tool search (Cmd+K)",
        "🎁 Referral program with bonus tokens",
        "📊 Usage analytics dashboard",
        "📝 Terms of Service & Privacy Policy",
        "🥞 Cookie consent (GDPR)",
        "💬 Live chat widget",
        "⭐ Testimonials section",
        "📰 Blog/news section",
      ],
    },
    {
      version: "1.0.0",
      date: "March 1, 2026",
      changes: [
        "🚀 Launch with 45 AI tools",
        "💰 Token economy system",
        "💳 Stripe & Coinbase payments",
        "🎥 Ad-powered token earning",
        "📈 3 subscription tiers + free tier",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-[var(--color-text-secondary)] mb-8">What&apos;s new in AI Empire</p>
        <div className="space-y-8">
          {entries.map((entry) => (
            <div key={entry.version} className="rounded-2xl border border-[var(--color-border)] p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg font-bold">v{entry.version}</span>
                <span className="text-xs text-[var(--color-text-secondary)]">{entry.date}</span>
                {entry.tag && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">{entry.tag}</span>
                )}
              </div>
              <ul className="space-y-2">
                {entry.changes.map((c, i) => (
                  <li key={i} className="text-sm text-[var(--color-text-secondary)]">{c}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-[var(--color-text-secondary)] mt-8">© 2026 AI Empire • <a href="/" className="underline">Back to Home</a></p>
      </div>
    </div>
  );
}
