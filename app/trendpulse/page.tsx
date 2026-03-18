import DashboardLayout from "@/components/dashboard-layout";
import TrendPulseClient from "@/components/trendpulse/trendpulse-client";

export default function TrendPulsePage() {
  return (
    <DashboardLayout>
      <TrendPulseClient />
    </DashboardLayout>
  );
}
