const CACHE_NAME = "ilker-market-v2"

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json"
]

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  )

  self.skipWaiting()
})

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          // Sadece eski müşteri cache'lerini sil
          // Admin cache'lerine dokunma
          .filter(key =>
            key.startsWith("ilker-market-") &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      )
    )
  )

  self.clients.claim()
})

self.addEventListener("fetch", event => {
  const request = event.request
  const url = new URL(request.url)

  // Admin panelini müşteri Service Worker'ı yönetmesin
  if (url.pathname.startsWith("/admin/")) {
    return
  }

  // POST, PUT, DELETE gibi işlemlere karışma
  if (request.method !== "GET") {
    return
  }

  // Railway gibi farklı adreslerdeki API isteklerine karışma
  if (url.origin !== self.location.origin) {
    return
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})