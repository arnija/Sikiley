const C = "sikiley-v13";
const ASSETS = ["index.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin) return;            // OSM/Google links hit network normally
  // network-first: fresh when online, cached copy when offline
  e.respondWith(
    fetch(e.request).then(resp => {
      const cp = resp.clone();
      caches.open(C).then(c => c.put(e.request, cp)).catch(() => {});
      return resp;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
