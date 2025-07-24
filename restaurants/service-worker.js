const CACHE_NAME = "restaurants-cache-v1";
const FILES_TO_CACHE = [
  "/restaurants/index.html",
  "/restaurants/logo.png",
  "/restaurants/icon-192.png",
  "/restaurants/icon-512.png",
  "/restaurants/manifest.json",
  "/restaurants/calendar/index.html",
  "/restaurants/calendar/cal.js",
  "/restaurants/calculator/index.html",
  "/restaurants/calculator/calc.js",
  "/restaurants/shared/navbar.js",
  "/restaurants/shared/renderer.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/restaurants/")) {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          return (
            response ||
            fetch(event.request).then((fetchRes) => {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request.url, fetchRes.clone());
                return fetchRes;
              });
            })
          );
        })
        .catch(() => {
          return caches.match("/restaurants/index.html");
        })
    );
  }
});
