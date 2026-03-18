import DashboardLayout from "@/components/dashboard-layout";
import DataWeaveClient from "@/components/dataweave/dataweave-client";

export default function DataWeavePage() {
  return (
    <DashboardLayout>
      <DataWeaveClient />
    </DashboardLayout>
  );
}
