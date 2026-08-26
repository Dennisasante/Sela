const CACHE_NAME = "sela-shell-v3";
const APP_SHELL = ["/", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Only ever intercept full-page navigations, and only to provide an
  // offline fallback. Everything else — RSC/data fetches from client-side
  // navigation, API routes, even static assets — goes straight to the
  // network. A previous cache-first version here cached every GET response
  // indefinitely (including error responses and stale app data), which is
  // what caused data to look stale or "vanish" after switching tabs. Next.js
  // already sets long-lived immutable cache headers on hashed static assets,
  // so the browser's own HTTP cache handles that case without help here.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () => caches.match(request).then((cached) => cached || caches.match("/offline.html"))
      )
    );
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Sela", body: event.data.text() };
  }

  const title = payload.title || "Sela";
  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: payload.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
