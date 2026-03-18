import DashboardLayout from "@/components/dashboard-layout";
import SoundForgeClient from "@/components/soundforge/soundforge-client";

export default function SoundForgePage() {
  return (
    <DashboardLayout>
      <SoundForgeClient />
    </DashboardLayout>
  );
}
