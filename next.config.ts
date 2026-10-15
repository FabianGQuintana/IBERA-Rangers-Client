import type { NextConfig } from "next";

// Backend (IberaReclamos API). The browser always calls "/api/..." on this same origin and Next forwards it,
// so there is no CORS to configure and the phone only needs to reach this app.
const API_URL = (process.env.API_URL ?? "http://localhost:5196").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // The repo lives inside OneDrive next to other lockfiles; pin the root so Turbopack does not guess.
  turbopack: { root: process.cwd() },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
      // Photos saved on the API's local disk when Cloudflare R2 is not configured (development)
      { source: "/uploads/:path*", destination: `${API_URL}/uploads/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Camera and GPS only for this app
          { key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=()" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
