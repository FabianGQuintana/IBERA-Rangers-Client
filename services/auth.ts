import { apiFetch } from "@/lib/api/client";
import { sessionStore } from "@/lib/session";
import type { LoginResponse } from "@/types/auth";

export async function login(email: string, password: string) {
  const res = await apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    auth: false,
    json: { email: email.trim(), password },
  });
  sessionStore.write({ token: res.token, expiresAt: res.expiresAt, user: res.user });
  return res.user;
}
