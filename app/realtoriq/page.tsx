import DashboardLayout from "@/components/dashboard-layout";
import RealtorIQClient from "@/components/realtoriq/realtoriq-client";

export default function RealtorIQPage() {
  return (
    <DashboardLayout>
      <RealtorIQClient />
    </DashboardLayout>
  );
}
