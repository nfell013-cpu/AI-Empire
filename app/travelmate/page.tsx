import DashboardLayout from "@/components/dashboard-layout";
import TravelMateClient from "@/components/travelmate/travelmate-client";

export default function TravelMatePage() {
  return (
    <DashboardLayout>
      <TravelMateClient />
    </DashboardLayout>
  );
}
