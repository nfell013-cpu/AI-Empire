import DashboardLayout from "@/components/dashboard-layout";
import MailPilotClient from "@/components/mailpilot/mailpilot-client";

export default function MailPilotPage() {
  return (
    <DashboardLayout>
      <MailPilotClient />
    </DashboardLayout>
  );
}
