import DashboardLayout from "@/components/dashboard-layout";
import CodeAuditClient from "@/components/codeaudit/codeaudit-client";

export default function CodeAuditPage() {
  return (
    <DashboardLayout>
      <CodeAuditClient />
    </DashboardLayout>
  );
}
