"use client";

import { useSyncExternalStore } from "react";
import { hasValidToken, sessionStore } from "@/lib/session";

export function useSession() {
  const session = useSyncExternalStore(sessionStore.subscribe, sessionStore.read, sessionStore.serverSnapshot);
  return { session, tokenValid: hasValidToken(session) };
}
