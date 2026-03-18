import DashboardLayout from "@/components/dashboard-layout";
import HealthPulseClient from "@/components/healthpulse/healthpulse-client";

export default function HealthPulsePage() {
  return (
    <DashboardLayout>
      <HealthPulseClient />
    </DashboardLayout>
  );
}
