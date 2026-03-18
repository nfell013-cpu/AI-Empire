import DashboardLayout from "@/components/dashboard-layout";
import VideoSyncClient from "@/components/videosync/videosync-client";

export default function VideoSyncPage() {
  return (
    <DashboardLayout>
      <VideoSyncClient />
    </DashboardLayout>
  );
}
