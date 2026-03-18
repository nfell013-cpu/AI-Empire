import DashboardLayout from "@/components/dashboard-layout";
import ContractIQClient from "@/components/contractiq/contractiq-client";

export default function ContractIQPage() {
  return (
    <DashboardLayout>
      <ContractIQClient />
    </DashboardLayout>
  );
}
