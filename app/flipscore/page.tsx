import DashboardLayout from "@/components/dashboard-layout";
import FlipScoreClient from "@/components/flipscore/flipscore-client";

export default function FlipScorePage() {
  return (
    <DashboardLayout>
      <FlipScoreClient />
    </DashboardLayout>
  );
}
