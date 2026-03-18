import DashboardLayout from "@/components/dashboard-layout";
import InvoiceProClient from "@/components/invoicepro/invoicepro-client";

export default function InvoiceProPage() {
  return (
    <DashboardLayout>
      <InvoiceProClient />
    </DashboardLayout>
  );
}
