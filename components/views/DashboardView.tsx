"use client";

import { useState } from "react";
import { BigButton } from "@/components/ui/BigButton";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import type { UserProfile } from "@/types/auth";

type Props = {
  user: UserProfile;
  /** null while the phone's database is being read */
  pendingCount: number | null;
  onNewReport: () => void;
  onSync: () => void;
  onLogout: () => void;
};

/**
 * Vista 1 — Pantalla principal. Two giant buttons and nothing else competing for attention.
 * "Salir" is at the bottom, smaller and neutral, so it is not pressed by accident.
 */
export function DashboardView({ user, pendingCount, onNewReport, onSync, onLogout }: Props) {
  const [confirmLogout, setConfirmLogout] = useState(false);

  const syncLabel =
    pendingCount === null
      ? "Sincronizar"
      : pendingCount === 0
        ? "Sincronizar (nada pendiente)"
        : `Sincronizar (${pendingCount} ${pendingCount === 1 ? "pendiente" : "pendientes"})`;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-xl flex-col">
      <header className="border-b-2 border-line bg-surface px-4 py-4">
        <h1 className="font-display text-[2.2rem] font-extrabold leading-tight">Hola, {user.name}</h1>
      </header>

      <OfflineBanner />

      <main className="safe-bottom flex flex-1 flex-col gap-5 px-4 py-5">
        <BigButton size="hero" icon="📸" onClick={onNewReport}>
          Nuevo reporte
        </BigButton>

        <BigButton
          size="hero"
          variant="sync"
          icon="🔄"
          onClick={onSync}
          aria-label={pendingCount ? `${syncLabel}. Tenés reportes guardados en el teléfono sin enviar.` : syncLabel}
        >
          {syncLabel}
        </BigButton>

        <div className="mt-auto pt-4">
          {confirmLogout ? (
            <div role="alertdialog" aria-labelledby="logout-question" className="flex flex-col gap-3 rounded-2xl border-[3px] border-danger p-4">
              <p id="logout-question" className="text-xl font-bold">
                {pendingCount
                  ? `¿Salir? Los ${pendingCount} reportes sin enviar quedan guardados en este teléfono.`
                  : "¿Seguro que querés salir?"}
              </p>
              <BigButton variant="danger" icon="🚪" onClick={onLogout}>
                Sí, salir
              </BigButton>
              <BigButton variant="neutral" onClick={() => setConfirmLogout(false)}>
                No, quedarme
              </BigButton>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="min-h-16 w-full rounded-2xl border-[3px] border-line px-4 text-lg font-bold text-mute active:bg-surface"
            >
              <span aria-hidden="true">🚪 </span>Salir de mi usuario
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
