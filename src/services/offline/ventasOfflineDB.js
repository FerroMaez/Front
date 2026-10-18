// Cola local de ventas físicas hechas SIN internet (IndexedDB del navegador).
//
// Por qué IndexedDB y no localStorage: sobrevive a cerrar la pestaña o reiniciar el PC,
// admite mucho más espacio y sus escrituras son transaccionales (no se corrompe a medias).
//
// Cada registro: { clave, fechaVenta, venta, estado, motivo, creadaEn, enviadaEn }
//   estado: PENDIENTE (falta enviar) → ENVIADA (ya está en RabbitMQ) → se borra al confirmarse
//           RECHAZADA (el backend no pudo registrarla, p. ej. sin stock: el JEFE decide)

const DB_NAME = 'manhid-offline'
const STORE   = 'ventas'

let dbPromise = null

function abrir() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'clave' })
      req.onsuccess = () => resolve(req.result)
      req.onerror   = () => { dbPromise = null; reject(req.error) }
    })
  }
  return dbPromise
}

async function tx(modo, fn) {
  const db = await abrir()
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, modo)
    const resultado = fn(t.objectStore(STORE))
    t.oncomplete = () => resolve(resultado?.result ?? resultado)
    t.onerror    = () => reject(t.error)
  })
}

export const ventasOfflineDB = {
  guardar: (registro) => tx('readwrite', s => s.put(registro)),
  listar:  () => tx('readonly', s => s.getAll()),
  obtener: (clave) => tx('readonly', s => s.get(clave)),
  borrar:  (clave) => tx('readwrite', s => s.delete(clave)),
  async actualizar(clave, cambios) {
    const actual = await this.obtener(clave)
    if (actual) await this.guardar({ ...actual, ...cambios })
  },
}
