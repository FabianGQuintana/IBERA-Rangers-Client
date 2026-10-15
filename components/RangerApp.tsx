"use client";

import { BigButton } from "@/components/ui/BigButton";
import { Screen } from "@/components/ui/Screen";
import { LoginView } from "@/components/views/LoginView";
import { useHydrated } from "@/hooks/useHydrated";
import { useSession } from "@/hooks/useSession";
import { clearSession } from "@/lib/session";

/**
 * The whole app is one page that switches views in memory. That way it opens and works without signal:
 * the service worker only has to keep "/" and the JS bundle.
 */
export function RangerApp() {
  const hydrated = useHydrated();
  const { session } = useSession();

  // Until we read the phone's storage we do not know if there is a session: show a neutral splash.
  if (!hydrated) return <Splash />;

  if (!session) return <LoginView />;

  return (
    <Screen title={`Hola, ${session.user.name}`}>
      <p className="text-xl">Ya entraste. Las pantallas de reporte llegan en el próximo paso.</p>
      <BigButton variant="neutral" icon="🚪" onClick={clearSession}>
        Salir
      </BigButton>
    </Screen>
  );
}

function Splash() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-primary">
      <p className="font-display text-3xl font-extrabold text-white">Iberá · Guardaparques</p>
    </div>
  );
}
