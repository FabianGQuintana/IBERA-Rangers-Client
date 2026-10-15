"use client";

import { useEffect } from "react";
import { Screen } from "@/components/ui/Screen";
import { DashboardView } from "@/components/views/DashboardView";
import { LoginView } from "@/components/views/LoginView";
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

  if (view === "new-report") {
    return (
      <Screen title="Nuevo reporte" onBack={() => go("home")}>
        <p className="text-xl">Próximo paso: foto, ubicación y categoría.</p>
      </Screen>
    );
  }

  if (view === "sync") {
    return (
      <Screen title="Sincronizar" onBack={() => go("home")}>
        <p className="text-xl">Próximo paso: enviar los reportes guardados.</p>
      </Screen>
    );
  }

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
