import { FaWifi, FaSyncAlt, FaTrash, FaExclamationTriangle } from 'react-icons/fa'
import { useOfflineStore } from '../../../store/offlineStore'
import { sincronizar, ventasOfflineSync } from '../../../services/offline/ventasOfflineSync'
import { formatDate } from '../../../utils/formatters'

const ESTADO = {
  PENDIENTE: { label: 'Esperando internet', cls: 'bg-yellow-500/10 border-yellow-500/25 text-yellow-600 dark:text-yellow-300' },
  ENVIADA:   { label: 'Procesando…',        cls: 'bg-blue-500/10 border-blue-500/25 text-blue-600 dark:text-blue-300' },
  RECHAZADA: { label: 'Rechazada',          cls: 'bg-red-500/10 border-red-500/25 text-red-500' },
}

// Lista las ventas de la cola local (IndexedDB). No se muestra si está vacía.
export default function VentasOfflinePanel() {
  const { online, ventas } = useOfflineStore()
  if (ventas.length === 0) return null

  const unidades = (v) => v.venta.items.reduce((s, i) => s + i.cantidad, 0)

  return (
    <div className="mb-6 rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--tx-1)' }}>
            Ventas sin internet ({ventas.length})
          </p>
          <p className="text-xs" style={{ color: 'var(--tx-3)' }}>
            {online
              ? 'Se envían solas; cada venta se registra una sola vez aunque se reintente.'
              : 'Sin conexión: quedan guardadas en este equipo hasta que vuelva el internet.'}
          </p>
        </div>
        <button onClick={sincronizar} disabled={!online}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors disabled:opacity-50"
          style={{ color: 'var(--tx-2)', borderColor: 'var(--bd-1)' }}>
          {online ? <FaSyncAlt size={11} /> : <FaWifi size={11} />} {online ? 'Sincronizar ahora' : 'Sin conexión'}
        </button>
      </div>

      <ul className="space-y-2">
        {ventas.map(v => {
          const cfg = ESTADO[v.estado] || ESTADO.PENDIENTE
          return (
            <li key={v.clave} className="flex items-center justify-between gap-3 flex-wrap px-3 py-2 rounded-xl"
              style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--tx-1)' }}>
                  {v.venta.cliente?.nombre} · {unidades(v)} und.
                </p>
                <p className="text-xs" style={{ color: 'var(--tx-3)' }}>{formatDate(v.fechaVenta)}</p>
                {v.estado === 'RECHAZADA' && v.motivo && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                    <FaExclamationTriangle size={10} /> {v.motivo}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${cfg.cls}`}>{cfg.label}</span>
                {v.estado === 'RECHAZADA' && (
                  <>
                    <button onClick={() => ventasOfflineSync.reintentar(v.clave)} title="Reintentar (p. ej. después de reponer stock)"
                      className="p-1.5 rounded-lg hover:bg-brand-500/10" style={{ color: 'var(--tx-2)' }}>
                      <FaSyncAlt size={11} />
                    </button>
                    <button onClick={() => { if (confirm('¿Descartar esta venta? No se registrará.')) ventasOfflineSync.descartar(v.clave) }}
                      title="Descartar" className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10">
                      <FaTrash size={11} />
                    </button>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
