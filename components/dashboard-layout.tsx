"use client";

import Sidebar from "./sidebar";
import NotificationBell from "./notification-bell";
import DarkModeToggle from "./dark-mode-toggle";
import ToolSearch from "./tool-search";
import StreakTracker from "./streak-tracker";
import TokenWarning from "./token-warning";
import OnboardingTour from "./onboarding-tour";
import KeyboardShortcuts from "./keyboard-shortcuts";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession() || {};
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading AI Empire...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const user = session?.user as { name?: string; email?: string } | undefined;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar userName={user?.name ?? ""} userEmail={user?.email ?? ""} />
      <main className="flex-1 ml-64 min-h-screen">
        {/* Enhancement #6, #8, #12: Top bar with search, notifications, dark mode */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3"
          style={{ background: "var(--bg-primary)", borderBottom: "1px solid var(--border)" }}>
          <ToolSearch />
          <div className="flex items-center gap-2">
            <StreakTracker />
            <DarkModeToggle />
            <NotificationBell />
          </div>
        </header>
        {children}
      </main>
      <TokenWarning />
      <OnboardingTour />
      <KeyboardShortcuts />
    </div>
  );
}
