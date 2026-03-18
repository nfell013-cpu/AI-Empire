import DashboardLayout from "@/components/dashboard-layout";
import FitForgeClient from "@/components/fitforge/fitforge-client";

export default function FitForgePage() {
  return (
    <DashboardLayout>
      <FitForgeClient />
    </DashboardLayout>
  );
}
