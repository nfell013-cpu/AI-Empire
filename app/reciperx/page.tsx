import DashboardLayout from "@/components/dashboard-layout";
import RecipeRxClient from "@/components/reciperx/reciperx-client";

export default function RecipeRxPage() {
  return (
    <DashboardLayout>
      <RecipeRxClient />
    </DashboardLayout>
  );
}
