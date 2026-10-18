// Sincroniza la cola local de ventas offline con el backend (que las mete en RabbitMQ).
//
//   venta sin internet ──▶ IndexedDB (PENDIENTE)
//   vuelve internet    ──▶ POST /ordenes/venta-fisica/offline ──▶ 202 ──▶ ENVIADA
//   el consumidor del backend procesa ──▶ WebSocket /topic/ventas-offline
//        CONFIRMADA / DUPLICADA ──▶ se borra de la cola
//        RECHAZADA              ──▶ queda visible para que el JEFE la revise
//
// Reenviar es SEGURO: cada venta lleva una clave única (UUID) y el backend no la registra dos veces.

import api from '../api/axiosInstance'
import { websocketService } from '../api/websocketService'
import { ventasOfflineDB } from './ventasOfflineDB'
import { useOfflineStore } from '../../store/offlineStore'

const INTERVALO_MS        = 30_000
const MAX_POR_LOTE        = 100
// Si una venta ENVIADA no recibe resultado en este tiempo (p. ej. se perdió el WebSocket),
// se reenvía: el backend responderá DUPLICADA o la registrará si nunca llegó.
const REENVIO_ENVIADA_MS  = 5 * 60_000

let sincronizando = false
let iniciado = false
const resultadoListeners = new Set()

export function nuevaClave() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  // Respaldo para contextos no seguros (http fuera de localhost)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/** ¿El error es por falta de conexión (no hubo respuesta del servidor)? */
export function esErrorDeRed(err) {
  return !navigator.onLine || (err && !err.response)
}

async function refrescarStore() {
  const ventas = await ventasOfflineDB.listar()
  ventas.sort((a, b) => a.creadaEn.localeCompare(b.creadaEn))
  useOfflineStore.getState().setVentas(ventas)
}

/** Guarda una venta en la cola local. Usa la MISMA clave que el intento online fallido. */
export async function encolarVenta({ clave, items, cliente, descripcion }) {
  const ahora = new Date().toISOString()
  await ventasOfflineDB.guardar({
    clave,
    fechaVenta: ahora,
    venta: { items, cliente, descripcion: descripcion || null },
    estado: 'PENDIENTE',
    motivo: null,
    creadaEn: ahora,
    enviadaEn: null,
  })
  await refrescarStore()
  sincronizar()
}

export async function sincronizar() {
  if (sincronizando || !navigator.onLine) return
  sincronizando = true
  try {
    const ahora = Date.now()
    const porEnviar = (await ventasOfflineDB.listar())
      .filter(v => v.estado === 'PENDIENTE'
        || (v.estado === 'ENVIADA' && ahora - new Date(v.enviadaEn).getTime() > REENVIO_ENVIADA_MS))
      .sort((a, b) => a.creadaEn.localeCompare(b.creadaEn))   // en el orden en que se vendieron

    for (let i = 0; i < porEnviar.length; i += MAX_POR_LOTE) {
      const lote = porEnviar.slice(i, i + MAX_POR_LOTE)
      try {
        await api.post('/ordenes/venta-fisica/offline', {
          ventas: lote.map(v => ({ claveIdempotencia: v.clave, fechaVenta: v.fechaVenta, venta: v.venta })),
        })
        const enviadaEn = new Date().toISOString()
        for (const v of lote) await ventasOfflineDB.actualizar(v.clave, { estado: 'ENVIADA', enviadaEn })
      } catch (err) {
        if (err.response?.status === 400) {
          // Datos inválidos: reintentar no lo arregla. Se deja visible para el JEFE.
          const motivo = 'Datos de la venta inválidos'
          for (const v of lote) await ventasOfflineDB.actualizar(v.clave, { estado: 'RECHAZADA', motivo })
        } else {
          break   // sin red / servidor caído / broker caído: se quedan PENDIENTES y se reintenta luego
        }
      }
    }
  } finally {
    sincronizando = false
    await refrescarStore()
  }
}

async function alRecibirResultado(r) {
  const venta = await ventasOfflineDB.obtener(r.claveIdempotencia)
  if (!venta) return
  if (r.estado === 'RECHAZADA') {
    await ventasOfflineDB.actualizar(r.claveIdempotencia, { estado: 'RECHAZADA', motivo: r.motivo })
  } else {
    await ventasOfflineDB.borrar(r.claveIdempotencia)
  }
  await refrescarStore()
  resultadoListeners.forEach(fn => { try { fn(r) } catch (_) {} })
}

export const ventasOfflineSync = {
  /** Arranca la sincronización (una sola vez por carga de la app). */
  iniciar() {
    if (iniciado) return
    iniciado = true
    const setOnline = () => useOfflineStore.getState().setOnline(navigator.onLine)
    window.addEventListener('online',  () => { setOnline(); sincronizar() })
    window.addEventListener('offline', setOnline)
    websocketService.onVentaOffline(alRecibirResultado)
    setInterval(sincronizar, INTERVALO_MS)
    refrescarStore().then(sincronizar).catch(() => {})
  },

  onResultado(fn) {
    resultadoListeners.add(fn)
    return () => resultadoListeners.delete(fn)
  },

  /** El JEFE descarta una venta rechazada (ya la gestionó a mano). */
  async descartar(clave) {
    await ventasOfflineDB.borrar(clave)
    await refrescarStore()
  },

  /** El JEFE corrige el problema (p. ej. repuso stock) y la vuelve a intentar. */
  async reintentar(clave) {
    await ventasOfflineDB.actualizar(clave, { estado: 'PENDIENTE', motivo: null })
    await refrescarStore()
    sincronizar()
  },
}
