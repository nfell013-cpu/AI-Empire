import DashboardLayout from "@/components/dashboard-layout";
import ChatGeniusClient from "@/components/chatgenius/chatgenius-client";

export default function ChatGeniusPage() {
  return (
    <DashboardLayout>
      <ChatGeniusClient />
    </DashboardLayout>
  );
}
