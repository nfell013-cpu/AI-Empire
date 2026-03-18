import DashboardLayout from "@/components/dashboard-layout";
import SketchAIClient from "@/components/sketchai/sketchai-client";

export default function SketchAIPage() {
  return (
    <DashboardLayout>
      <SketchAIClient />
    </DashboardLayout>
  );
}
