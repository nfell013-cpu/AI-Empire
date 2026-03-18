import DashboardLayout from "@/components/dashboard-layout";
import DataVaultClient from "@/components/datavault/datavault-client";

export default function DataVaultPage() {
  return (
    <DashboardLayout>
      <DataVaultClient />
    </DashboardLayout>
  );
}
