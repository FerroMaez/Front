// Service worker de MANHID: hace que la app siga viéndose sin internet.
//
// Se coloca entre la página y la red e intercepta las peticiones:
//   · Imágenes  → "cache first": si ya está guardada se sirve al instante (con o sin red);
//                 si no, se descarga y se guarda para la próxima vez.
//   · Página y JS/CSS (solo en producción) → "network first": con red se usa lo último;
//                 sin red se usa la copia guardada, así la app abre aunque se recargue offline.
//   · API (/api, otro dominio) → NO se toca: los datos siempre van a la red; las ventas
//                 offline las maneja la cola de IndexedDB, no la caché.
//
// En desarrollo (vite dev) solo se cachean imágenes: cachear los módulos de Vite rompería
// la recarga en caliente (HMR).

const VERSION   = 'v1'
const CACHE_IMG = `manhid-img-${VERSION}`
const CACHE_APP = `manhid-app-${VERSION}`
const MODO_PROD = new URL(self.location).searchParams.get('mode') === 'prod'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  // Borra cachés de versiones anteriores del service worker
  event.waitUntil((async () => {
    const vigentes = [CACHE_IMG, CACHE_APP]
    for (const nombre of await caches.keys()) {
      if (nombre.startsWith('manhid-') && !vigentes.includes(nombre)) await caches.delete(nombre)
    }
    await self.clients.claim()
  })())
})

// La página pide precargar imágenes (p. ej. las de todos los productos)
self.addEventListener('message', (event) => {
  if (event.data?.tipo !== 'PRECARGAR_IMAGENES') return
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_IMG)
    for (const url of event.data.urls || []) {
      if (await cache.match(url)) continue
      try {
        const resp = await fetch(url)
        if (resp.ok) await cache.put(url, resp)
      } catch (_) { /* sin red: se intentará la próxima vez */ }
    }
  })())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  const mismoOrigen = url.origin === self.location.origin

  if (req.destination === 'image') {
    event.respondWith(cacheFirst(req, CACHE_IMG))
    return
  }
  if (!MODO_PROD || !mismoOrigen || url.pathname.startsWith('/api')) return

  if (req.mode === 'navigate') {
    // SPA: cualquier ruta sirve index.html
    event.respondWith(networkFirst(req, CACHE_APP, '/index.html'))
  } else if (['script', 'style', 'font', 'manifest'].includes(req.destination)) {
    event.respondWith(networkFirst(req, CACHE_APP))
  }
})

async function cacheFirst(req, nombreCache) {
  const cache = await caches.open(nombreCache)
  const guardada = await cache.match(req, { ignoreVary: true })
  if (guardada) return guardada
  try {
    const resp = await fetch(req)
    // ok = misma origen 200; opaque = imagen de otro dominio sin CORS (igual sirve para <img>)
    if (resp.ok || resp.type === 'opaque') cache.put(req, resp.clone())
    return resp
  } catch (err) {
    return Response.error()
  }
}

async function networkFirst(req, nombreCache, claveFallback) {
  const cache = await caches.open(nombreCache)
  try {
    const resp = await fetch(req)
    if (resp.ok) cache.put(claveFallback || req, resp.clone())
    return resp
  } catch (err) {
    return (await cache.match(claveFallback || req)) || Response.error()
  }
}
