"use client";

import { useEffect } from "react";
import { DashboardView } from "@/components/views/DashboardView";
import { LoginView } from "@/components/views/LoginView";
import { NewReportView } from "@/components/views/NewReportView";
import { SyncView } from "@/components/views/SyncView";
import { useHydrated } from "@/hooks/useHydrated";
import { usePendingReports } from "@/hooks/usePendingReports";
import { useSession } from "@/hooks/useSession";
import { useView } from "@/hooks/useView";
import { clearSession } from "@/lib/session";
import { requestPersistentStorage } from "@/lib/storage/reports-db";

/**
 * The whole app is one page that switches views in memory. That way it opens and works without signal:
 * the service worker only has to keep "/" and the JS bundle.
 */
export function RangerApp() {
  const hydrated = useHydrated();
  const { session } = useSession();
  const { view, go } = useView();
  const { reports } = usePendingReports();

  useEffect(() => {
    requestPersistentStorage();
  }, []);

  // Until we read the phone's storage we do not know if there is a session: show a neutral splash.
  if (!hydrated) return <Splash />;

  if (!session) return <LoginView />;

  if (view === "new-report") return <NewReportView onDone={() => go("home")} />;

  if (view === "sync") return <SyncView onDone={() => go("home")} />;

  return (
    <DashboardView
      user={session.user}
      pendingCount={reports?.length ?? null}
      onNewReport={() => go("new-report")}
      onSync={() => go("sync")}
      onLogout={clearSession}
    />
  );
}

function Splash() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-primary">
      <p className="font-display text-3xl font-extrabold text-white">Iberá · Guardaparques</p>
    </div>
  );
}
