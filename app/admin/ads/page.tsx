"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import Sidebar from "@/components/sidebar";
import AdminReviewPanel from "@/components/ads/admin-review-panel";

export default function AdminAdsPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}><p style={{ color: 'var(--text-secondary)' }}>Loading...</p></div>;
  }

  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    redirect('/dashboard');
  }

  const user = session.user as { name?: string; email?: string };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar userName={user?.name} userEmail={user?.email} />
      <main className="ml-64 p-6 md:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-6 h-6" style={{ color: 'var(--accent)' }} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              <span className="text-gradient">Ad Review Panel</span>
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Review, approve, or reject submitted advertisements.</p>
        </div>

        <AdminReviewPanel />
      </main>
    </div>
  );
}
