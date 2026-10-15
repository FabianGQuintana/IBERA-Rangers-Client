// Módulo Ranger service worker: the app opens in the field without signal once it was opened with signal.
// Hand-written (no dependencies), same approach as IberAPP. Bump VERSION to drop every old cache on the next visit.
// Reports are NOT handled here: they live in IndexedDB and are sent by the sync screen.
const VERSION = "v1";
const PAGES = `ranger-pages-${VERSION}`;
const STATIC = `ranger-static-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.addAll(["/", "/manifest.webmanifest", "/icon.svg"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const keep = [PAGES, STATIC];
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("ranger-") && !keep.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// The app is a single page ("/"): every navigation gets it, fresh with signal and cached without it.
async function page(request) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put("/", res.clone());
    return res;
  } catch {
    return (await cache.match("/")) ?? Response.error();
  }
}

// Hashed build files never change: cache first.
async function cacheFirst(request) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) await cache.put(request, res.clone());
  return res;
}

// Manifest and icons: cached copy at once, refreshed in the background.
async function staleWhileRevalidate(request) {
  const cache = await caches.open(PAGES);
  const hit = await cache.match(request);
  const refresh = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => hit ?? Response.error());
  return hit ?? refresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/")) return; // always live data

  if (request.mode === "navigate") return event.respondWith(page(request));
  if (url.pathname.startsWith("/_next/static/")) return event.respondWith(cacheFirst(request));
  if (url.pathname === "/manifest.webmanifest" || url.pathname === "/icon.svg" || url.pathname === "/favicon.ico")
    return event.respondWith(staleWhileRevalidate(request));
});
