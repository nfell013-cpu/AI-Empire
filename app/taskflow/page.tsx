import DashboardLayout from "@/components/dashboard-layout";
import TaskFlowClient from "@/components/taskflow/taskflow-client";

export default function TaskFlowPage() {
  return (
    <DashboardLayout>
      <TaskFlowClient />
    </DashboardLayout>
  );
}
