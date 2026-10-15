import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repo lives inside OneDrive next to other lockfiles; pin the root so Turbopack does not guess.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
