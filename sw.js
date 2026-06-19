/* ==========================================
   Enhanced Service Worker
   Features: Cache-first strategy, Background sync, Offline support
========================================== */

const CACHE_NAME = "dds-v2";
const RUNTIME_CACHE = "dds-runtime-v2";
const IMAGE_CACHE = "dds-images-v2";

const urlsToCache = [
  "/",
  "index.html",
  "dashboard.html",
  "inspect.html",
  "management.html",
  "style.css",
  "script.js",
  "sw.js"
];

// Install event - cache all essential files
self.addEventListener("install", event => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log("[SW] Caching core assets");
          return cache.addAll(urlsToCache);
        }),
      caches.open(RUNTIME_CACHE),
      caches.open(IMAGE_CACHE)
    ]).then(() => self.skipWaiting())
  );
});

// Fetch event - cache-first strategy with fallback
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle image requests separately
  if (request.destination === "image") {
    event.respondWith(cacheImage(request));
    return;
  }

  // Handle API calls (not cached)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetchNetworkFirst(request));
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(cacheFirst(request));
});

// Activate event - cleanup old caches
self.addEventListener("activate", event => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== IMAGE_CACHE) {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Background sync for saving inspections
self.addEventListener("sync", event => {
  if (event.tag === "sync-inspections") {
    event.waitUntil(syncInspections());
  }
});

// ==========================================
// Caching Strategies
// ==========================================

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (!networkResponse || networkResponse.status !== 200) {
      return networkResponse;
    }

    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error("[SW] Fetch failed; returning offline page:", error);
    return caches.match("dashboard.html") || new Response("Offline - Page not cached");
  }
}

// Network-first strategy for API calls
async function fetchNetworkFirst(request) {
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
    ]);
    return networkResponse;
  } catch (error) {
    console.error("[SW] Network request failed:", error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response("Offline - API not available", { status: 503 });
  }
}

// Image caching strategy
async function cacheImage(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (!networkResponse || networkResponse.status !== 200) {
      return networkResponse;
    }

    const cache = await caches.open(IMAGE_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error("[SW] Image fetch failed:", error);
    // Return a placeholder or cached response
    return new Response("Image not available", { status: 404 });
  }
}

// Background sync for inspections
async function syncInspections() {
  try {
    const inspections = await getStoredInspections();
    if (inspections.length > 0) {
      const response = await fetch("/api/inspections/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inspections)
      });

      if (response.ok) {
        console.log("[SW] Inspections synced successfully");
        await clearSyncQueue();
      }
    }
  } catch (error) {
    console.error("[SW] Sync failed:", error);
    throw error; // Retry sync
  }
}

// Helper to get stored inspections from IndexedDB or localStorage
async function getStoredInspections() {
  // Implementation depends on where you store inspections
  // For now, returning empty array
  return [];
}

// Helper to clear sync queue
async function clearSyncQueue() {
  // Clear synced inspections
  return;
}

// Message handler for client communication
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
