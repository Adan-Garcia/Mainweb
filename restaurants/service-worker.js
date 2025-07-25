const CACHE_NAME = "restaurants-cache-v1";

const FILES_TO_CACHE = [
  "/restaurants/index.html",
  "/restaurants/dashboard/index.html",
  "/restaurants/shared/style.css",
  "/restaurants/shared/navbar.js",
  "/restaurants/shared/search.js",
  "/restaurants/shared/renderer.js",
  "/restaurants/icon-192.png",
  "/restaurants/icon-512.png",
  "/restaurants/logo.png",
  "/restaurants/calculator/index.html",
  "/restaurants/calculator/calc.js",
  "/restaurants/calendar/index.html",
  "/restaurants/calendar/cal.js",
  "/restaurants/restaurants/index.html",
  "/restaurants/rides/index.html",
  "/restaurants/rides/",
  "/restaurants/calendar/",
  "/restaurants/calculator/",
  "/restaurants/restaurants/",
  "/restaurants/Restaurants/",
  "/restaurants/dashboard/",
  "/restaurants/",
  // External font-awesome stylesheet (optional but needed for offline styling)
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Add local files
      await cache.addAll(FILES_TO_CACHE.filter((f) => f.startsWith("/")));

      // Manually fetch and cache external files
      const external = FILES_TO_CACHE.filter((f) => f.startsWith("http"));
      await Promise.all(
        external.map(async (url) => {
          try {
            const res = await fetch(url);
            if (res.ok) {
              await cache.put(url, res.clone());
            }
          } catch (e) {
            console.warn("Failed to cache:", url, e);
          }
        })
      );
    })()
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
  if (
    event.request.url.includes("/restaurants/") ||
    event.request.url.includes("font-awesome")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((res) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, res.clone());
              return res;
            });
          })
          .catch(() => {
            // If it's a navigation, show fallback index page
            if (event.request.mode === "navigate") {
              return caches.match("/restaurants/index.html");
            }

            // Basic fallbacks for styles or scripts
            if (event.request.destination === "style") {
              return new Response("/* offline style */", {
                headers: { "Content-Type": "text/css" },
              });
            }

            if (event.request.destination === "script") {
              return new Response("", {
                headers: { "Content-Type": "application/javascript" },
              });
            }

            return Response.error();
          });
      })
    );
  }
});
