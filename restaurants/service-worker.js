const cacheName = "disney-tracker-v1";
const assets = [
  "./",
  "./index.html",
  "./style.css",
  "./renderer.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];
const VERSION = "v1.0.1";
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
