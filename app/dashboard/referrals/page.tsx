// Enhancement #13: Referral Program Page
import DashboardLayout from '@/components/dashboard-layout';
import ReferralClient from '@/components/referral-client';

export const metadata = { title: 'Referral Program' };

export default function ReferralPage() {
  return (
    <DashboardLayout>
      <ReferralClient />
    </DashboardLayout>
  );
}
