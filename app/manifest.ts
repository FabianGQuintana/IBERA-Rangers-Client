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
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
