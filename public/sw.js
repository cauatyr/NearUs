/**
 * NearUs Service Worker
 * Estrategia: network-first con fallback a cache para soporte offline básico.
 */

const CACHE_VERSION = 'nearus-v2'
const RUTAS_PRECARGA = ['/', '/perfil', '/explorar', '/onboarding']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(RUTAS_PRECARGA).catch(() => {
        // No fallar la instalación si alguna ruta no se puede cachear
        return Promise.resolve()
      })
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter((n) => n !== CACHE_VERSION)
            .map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Solo GET y mismo origen
  if (request.method !== 'GET') return
  if (!request.url.startsWith(self.location.origin)) return

  // Ignorar rutas de desarrollo de Next.js (HMR, _next/webpack)
  if (request.url.includes('/_next/webpack-hmr')) return
  if (request.url.includes('/__nextjs')) return

  event.respondWith(
    fetch(request)
      .then((respuesta) => {
        // Cachear respuestas exitosas de navegación o assets
        if (respuesta.ok && (request.mode === 'navigate' || request.destination === 'image' || request.destination === 'style' || request.destination === 'script')) {
          const copia = respuesta.clone()
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(request, copia).catch(() => {})
          })
        }
        return respuesta
      })
      .catch(() => {
        // Sin red: servir del cache
        return caches.match(request).then((cacheado) => {
          if (cacheado) return cacheado
          // Si es una navegación y no hay cache, ir al home cacheado
          if (request.mode === 'navigate') {
            return caches.match('/')
          }
          return new Response('Sin conexión', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          })
        })
      })
  )
})
