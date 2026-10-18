// Registro del service worker (public/sw.js) y precarga de imágenes para usar sin internet.

export function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  // En producción también cachea la app (abre aunque se recargue offline); en dev solo imágenes.
  const url = import.meta.env.PROD ? '/sw.js?mode=prod' : '/sw.js'
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(url).catch(() => {})
  })
}

/** Pide al service worker que guarde estas imágenes (las que ya estén guardadas se saltan). */
export async function precargarImagenes(urls) {
  if (!('serviceWorker' in navigator)) return
  const unicas = [...new Set(urls.filter(Boolean))]
  if (unicas.length === 0) return
  try {
    const reg = await navigator.serviceWorker.ready
    reg.active?.postMessage({ tipo: 'PRECARGAR_IMAGENES', urls: unicas })
  } catch (_) { /* sin service worker: las imágenes solo se verán con internet */ }
}
