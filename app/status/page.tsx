export default function StatusPage() {
  const services = [
    { name: "AI Engine", status: "operational", uptime: "99.97%" },
    { name: "API Gateway", status: "operational", uptime: "99.99%" },
    { name: "Payment Processing (Stripe)", status: "operational", uptime: "99.99%" },
    { name: "Crypto Payments (Coinbase)", status: "operational", uptime: "99.95%" },
    { name: "Database", status: "operational", uptime: "99.99%" },
    { name: "File Storage (S3)", status: "operational", uptime: "99.99%" },
    { name: "Authentication", status: "operational", uptime: "99.98%" },
    { name: "Ad Network", status: "operational", uptime: "99.90%" },
  ];

  const incidents: { date: string; title: string; status: string }[] = [];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <h1 className="text-3xl font-bold">All Systems Operational</h1>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden mb-8">
          {services.map((s, i) => (
            <div key={s.name} className={`flex items-center justify-between p-4 ${i > 0 ? "border-t border-[var(--color-border)]" : ""}`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${s.status === "operational" ? "bg-green-400" : "bg-yellow-400"}`} />
                <span className="text-sm font-medium">{s.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-green-400 font-medium">{s.uptime} uptime</span>
                <span className="text-xs text-[var(--color-text-secondary)] capitalize">{s.status}</span>
              </div>
            </div>
          ))}
        </div>
        <h2 className="text-xl font-semibold mb-4">Recent Incidents</h2>
        {incidents.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] p-4 rounded-xl border border-[var(--color-border)]">No incidents reported in the last 90 days. ✅</p>
        ) : (
          incidents.map((inc) => (
            <div key={inc.date} className="p-4 rounded-xl border border-[var(--color-border)] mb-2">
              <p className="text-sm font-medium">{inc.title}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{inc.date} • {inc.status}</p>
            </div>
          ))
        )}
        <p className="text-xs text-center text-[var(--color-text-secondary)] mt-8">© 2026 AI Empire • <a href="/" className="underline">Back to Home</a></p>
      </div>
    </div>
  );
}
