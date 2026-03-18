import DashboardLayout from "@/components/dashboard-layout";
import PitchDeckClient from "@/components/pitchdeck/pitchdeck-client";

export default function PitchDeckPage() {
  return (
    <DashboardLayout>
      <PitchDeckClient />
    </DashboardLayout>
  );
}
