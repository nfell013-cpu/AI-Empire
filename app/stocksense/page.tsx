import DashboardLayout from "@/components/dashboard-layout";
import StockSenseClient from "@/components/stocksense/stocksense-client";

export default function StockSensePage() {
  return (
    <DashboardLayout>
      <StockSenseClient />
    </DashboardLayout>
  );
}
