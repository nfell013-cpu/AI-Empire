import DashboardLayout from '@/components/dashboard-layout';
import { DealDoneClient } from '@/components/dealdone/dealdone-client';

export default function DealDonePage() {
  return (
    <DashboardLayout>
      <DealDoneClient />
    </DashboardLayout>
  );
}
