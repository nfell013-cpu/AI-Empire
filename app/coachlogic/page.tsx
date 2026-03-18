import DashboardLayout from '@/components/dashboard-layout';
import { CoachLogicClient } from '@/components/coachlogic/coachlogic-client';

export default function CoachLogicPage() {
  return (
    <DashboardLayout>
      <CoachLogicClient />
    </DashboardLayout>
  );
}
