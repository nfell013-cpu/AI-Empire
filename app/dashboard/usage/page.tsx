// Enhancement #14: Usage History/Analytics Dashboard
import DashboardLayout from '@/components/dashboard-layout';
import UsageHistoryClient from '@/components/usage-history-client';

export const metadata = { title: 'Usage History' };

export default function UsageHistoryPage() {
  return (
    <DashboardLayout>
      <UsageHistoryClient />
    </DashboardLayout>
  );
}
