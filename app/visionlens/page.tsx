import DashboardLayout from '@/components/dashboard-layout';
import { VisionLensClient } from '@/components/visionlens/visionlens-client';

export default function VisionLensPage() {
  return (
    <DashboardLayout>
      <VisionLensClient />
    </DashboardLayout>
  );
}
