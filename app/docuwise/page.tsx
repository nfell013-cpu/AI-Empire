import DashboardLayout from "@/components/dashboard-layout";
import DocuWiseClient from "@/components/docuwise/docuwise-client";

export default function DocuWisePage() {
  return (
    <DashboardLayout>
      <DocuWiseClient />
    </DashboardLayout>
  );
}
