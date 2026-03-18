// Enhancement #16: Subscription Management Page
import DashboardLayout from '@/components/dashboard-layout';
import SubscriptionsClient from '@/components/subscriptions-client';

export const metadata = { title: 'Subscription Management' };

export default function SubscriptionsPage() {
  return (
    <DashboardLayout>
      <SubscriptionsClient />
    </DashboardLayout>
  );
}
