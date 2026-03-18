import DashboardLayout from '@/components/dashboard-layout';
import { PawPairClient } from '@/components/pawpair/pawpair-client';

export default function PawPairPage() {
  return (
    <DashboardLayout>
      <PawPairClient />
    </DashboardLayout>
  );
}
