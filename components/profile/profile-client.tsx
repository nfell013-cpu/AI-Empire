"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { User, Mail, FileText, CreditCard, Calendar, Zap } from "lucide-react";

type UserProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  scanCount: number;
  freeScanUsed: boolean;
  createdAt: string;
  recentScans: Array<{ id: string; fileName: string; status: string; createdAt: string; isFree: boolean }>;
};

export default function ProfileClient() {
  const { data: session } = useSession() || {};
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const user = session?.user as { name?: string; email?: string } | undefined;

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="shimmer rounded-2xl h-48 mb-4" />
        <div className="shimmer rounded-2xl h-32" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>Manage your account and view scan history.</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold" style={{ background: "rgba(99,102,241,0.2)", color: "var(--accent-light)" }}>
            {(profile?.firstName ?? user?.name ?? "U")[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg">{profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : user?.name ?? "User"}</h2>
            <p className="text-sm" style={{ color: "#9ca3af" }}>{profile?.email ?? user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Email", value: profile?.email ?? user?.email ?? "N/A", icon: Mail },
            { label: "Total Scans", value: `${profile?.scanCount ?? 0} scans`, icon: FileText },
            { label: "Free Scan", value: profile?.freeScanUsed ? "Used" : "Available", icon: Zap },
            { label: "Member Since", value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A", icon: Calendar },
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
