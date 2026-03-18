import DashboardLayout from "@/components/dashboard-layout";
import GuardianAIClient from "@/components/guardianai/guardianai-client";

export default function GuardianAIPage() {
  return (
    <DashboardLayout>
      <GuardianAIClient />
    </DashboardLayout>
  );
}
