import DashboardLayout from '@/components/dashboard-layout';
import { LeafCheckClient } from '@/components/leafcheck/leafcheck-client';

export default function LeafCheckPage() {
  return (
    <DashboardLayout>
      <LeafCheckClient />
    </DashboardLayout>
  );
}
