import DashboardLayout from "@/components/dashboard-layout";
import VoiceBoxClient from "@/components/voicebox/voicebox-client";

export default function VoiceBoxPage() {
  return (
    <DashboardLayout>
      <VoiceBoxClient />
    </DashboardLayout>
  );
}
