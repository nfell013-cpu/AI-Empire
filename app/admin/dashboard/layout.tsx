'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/sidebar';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
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
        {children}
      </main>
    </div>
  );
}
