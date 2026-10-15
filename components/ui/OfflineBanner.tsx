"use client";

import { useOnline } from "@/hooks/useOnline";

/** Tells the ranger, without alarming, that there is no signal and that everything is still saved on the phone. */
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;

  return (
    <p role="status" className="bg-warn px-4 py-3 text-center text-lg font-bold text-white">
      <span aria-hidden="true">📵 </span>Sin señal. Lo que guardes queda en el teléfono.
    </p>
  );
}
