const ADMIN_CACHE = 'ilker-admin-v1'

const ADMIN_FILES = [
  '/admin/',
  '/admin/index.html',
  '/admin/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(ADMIN_CACHE)
      .then(cache => cache.addAll(ADMIN_FILES))
  )

  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key.startsWith('ilker-admin-') && key !== ADMIN_CACHE)
          .map(key => caches.delete(key))
      )
    })
  )

  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)

  if (request.method !== 'GET') return

  // Railway API isteklerini önbelleğe alma
  if (url.origin !== self.location.origin) return

  event.respondWith(
    fetch(request)
      .then(response => {
        const responseCopy = response.clone()

        caches.open(ADMIN_CACHE).then(cache => {
          cache.put(request, responseCopy)
        })

        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)

        if (cached) return cached

        if (request.mode === 'navigate') {
          return caches.match('/admin/')
        }

        return new Response('Çevrimdışı', {
          status: 503,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8'
          }
        })
      })
  )
})