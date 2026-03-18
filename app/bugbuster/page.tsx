import DashboardLayout from "@/components/dashboard-layout";
import BugBusterClient from "@/components/bugbuster/bugbuster-client";

export default function BugBusterPage() {
  return (
    <DashboardLayout>
      <BugBusterClient />
    </DashboardLayout>
  );
}
