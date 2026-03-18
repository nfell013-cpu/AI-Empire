import DashboardLayout from "@/components/dashboard-layout";
import GlobeGuideClient from "@/components/globeguide/globeguide-client";

export default function GlobeGuidePage() {
  return (
    <DashboardLayout>
      <GlobeGuideClient />
    </DashboardLayout>
  );
}
