import type { MetadataRoute } from "next";

// Lets the ranger "install" the app on the home screen and open it full screen, like a native app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Iberá · Guardaparques",
    short_name: "Guardaparques",
    description: "Reportes ambientales del Gran Parque Iberá. Funciona sin señal.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f3f5f4",
    theme_color: "#14532d",
    lang: "es-AR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
