"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { User, Mail, FileText, CreditCard, Calendar, Zap, Camera, Save, Download, Star } from "lucide-react";

type UserProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  scanCount: number;
  tokenBalance: number;
  freeScanUsed: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  referralCode: string | null;
  createdAt: string;
  recentScans: Array<{ id: string; fileName: string; status: string; createdAt: string; isFree: boolean }>;
};

export default function ProfileClient() {
  const { data: session } = useSession() || {};
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", bio: "", avatarUrl: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d);
        setForm({ firstName: d.firstName ?? "", lastName: d.lastName ?? "", bio: d.bio ?? "", avatarUrl: d.avatarUrl ?? "" });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const user = session?.user as { name?: string; email?: string } | undefined;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile((p) => (p ? { ...p, ...updated } : p));
        setEditing(false);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleExport = async () => {
    const res = await fetch("/api/user/export-data");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="shimmer rounded-2xl h-48 mb-4" />
        <div className="shimmer rounded-2xl h-32" />
      </div>
    );
  }

  const initials = ((profile?.firstName ?? user?.name ?? "U")[0] ?? "U").toUpperCase();

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>Manage your account, avatar, and preferences.</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="relative">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold" style={{ background: "rgba(99,102,241,0.2)", color: "var(--accent-light)" }}>
                {initials}
              </div>
            )}
            <button onClick={() => setEditing(true)} className="absolute -bottom-1 -right-1 p-1 rounded-full bg-indigo-500 text-white">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg">{profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : user?.name ?? "User"}</h2>
            <p className="text-sm" style={{ color: "#9ca3af" }}>{profile?.email ?? user?.email}</p>
            {profile?.bio && <p className="text-sm mt-1" style={{ color: "#d1d5db" }}>{profile.bio}</p>}
          </div>
          <button onClick={() => setEditing(!editing)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition">
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing && (
          <div className="space-y-3 mb-5 p-4 rounded-xl" style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} placeholder="First name" className="px-3 py-2 rounded-lg text-sm bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] outline-none" />
              <input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} placeholder="Last name" className="px-3 py-2 rounded-lg text-sm bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] outline-none" />
            </div>
            <input value={form.avatarUrl} onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))} placeholder="Avatar URL (https://upload.wikimedia.org/wikipedia/commons/6/67/User_Avatar.png)" className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] outline-none" />
            <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Short bio..." rows={2} className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] outline-none resize-none" />
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Email", value: profile?.email ?? user?.email ?? "N/A", icon: Mail },
            { label: "Token Balance", value: `${profile?.tokenBalance ?? 0} tokens`, icon: Zap },
            { label: "Total Scans", value: `${profile?.scanCount ?? 0} scans`, icon: FileText },
            { label: "Member Since", value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A", icon: Calendar },
            { label: "Email Verified", value: profile?.emailVerified ? "Yes ✓" : "No", icon: Star },
            { label: "2FA", value: profile?.twoFactorEnabled ? "Enabled ✓" : "Disabled", icon: CreditCard },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-3" style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                <p className="text-xs" style={{ color: "#9ca3af" }}>{item.label}</p>
              </div>
              <p className="text-sm font-medium truncate">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Data Export */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)] transition">
          <Download className="w-4 h-4" /> Export My Data (GDPR)
        </button>
      </motion.div>

      {/* Scan History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4" style={{ color: "var(--accent)" }} />
          Scan History
        </h3>
        {(profile?.recentScans?.length ?? 0) === 0 ? (
          <p className="text-sm" style={{ color: "#9ca3af" }}>No scans yet. Try Legalese!</p>
        ) : (
          <div className="space-y-2">
            {profile?.recentScans?.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}>
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  <div>
                    <p className="text-sm font-medium truncate max-w-48">{scan.fileName}</p>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>{new Date(scan.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: scan.isFree ? "rgba(99,102,241,0.1)" : "rgba(16,185,129,0.1)", color: scan.isFree ? "var(--accent-light)" : "#10b981" }}>
                  {scan.isFree ? "Free" : "Paid"}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
