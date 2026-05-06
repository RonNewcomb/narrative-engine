declare const self: ServiceWorkerGlobalScope;

export const cacheName = "system-3";

const folder = ""; // serve from localhost:5173 or some such

const contentToCache = [
  folder + "/",
  folder + "/index.html",
  folder + "/system3.sample.txt.json",
  folder + "/icon.svg",
  folder + "/screenshot.png",
  folder + "/layout.css",
  folder + "/animate.css",
  //folder+"/manifest.json",
];

self.addEventListener("install", (e: ExtendableEvent) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("[Service Worker] Caching all: app shell and content");
      await cache.addAll(contentToCache);
    })(),
  );
});

self.addEventListener("fetch", (e: FetchEvent) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) return r;
      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })(),
  );
});

self.addEventListener("activate", (e: ExtendableEvent) => {
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key === cacheName) return;
          return caches.delete(key);
        }),
      );
    }),
  );
});
