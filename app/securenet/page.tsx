import DashboardLayout from "@/components/dashboard-layout";
import SecureNetClient from "@/components/securenet/securenet-client";

export default function SecureNetPage() {
  return (
    <DashboardLayout>
      <SecureNetClient />
    </DashboardLayout>
  );
}
