const cacheName = "disney-tracker-v1.0.4";
const assetsToCache = [
  "./",
  "./style.css",
  "./renderer.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

// Don't cache index.html aggressively — always revalidate it.
self.addEventListener("install", (event) => {
  self.skipWaiting(); // activate this SW immediately
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  clients.claim(); // take control of open tabs
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== cacheName) return caches.delete(key);
        })
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Always try network for HTML (like index.html) to avoid stale shell
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("./index.html")));
    return;
  }

  // For other assets, use cache-first fallback strategy
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request)
          .then((response) => {
            return response;
          })
          .catch(() => {
            // optional: return fallback here
          })
      );
    })
  );
});
