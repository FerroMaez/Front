import { useState, useEffect } from 'react'
import { FaPhone, FaEnvelope, FaCheckCircle, FaTimesCircle, FaSpinner, FaChevronDown } from 'react-icons/fa'
import { orderService } from '../../../services/api/orderService'
import { formatCOP, formatDate } from '../../../utils/formatters'
import Modal from '../../../components/ui/Modal'

const STATES  = ['PENDIENTE', 'EN_PROCESO', 'VENTA_EXITOSA', 'CANCELADA']
const MOTIVOS = ['Cliente no contestó', 'Cliente desistió de la compra', 'Producto no disponible a precios acordados', 'Error de cotización', 'Otro']

const STATE_CONFIG = {
  PENDIENTE:      { label: 'Pendiente',     color: 'yellow', bg: 'bg-yellow-500/10 border-yellow-500/25 text-yellow-600 dark:text-yellow-300' },
  EN_PROCESO:     { label: 'En Proceso',    color: 'blue',   bg: 'bg-blue-500/10 border-blue-500/25 text-blue-600 dark:text-blue-300' },
  VENTA_EXITOSA:  { label: 'Venta Exitosa', color: 'green',  bg: 'bg-green-500/10 border-green-500/25 text-green-600 dark:text-green-300' },
  CANCELADA:      { label: 'Cancelada',     color: 'red',    bg: 'bg-red-500/10 border-red-500/25 text-red-500' },
}

export default function OrdersPage() {
  const [orders,     setOrders]     = useState([])
  const [filter,     setFilter]     = useState('all')
  const [selected,   setSelected]   = useState(null)
  const [action,     setAction]     = useState(null)   // 'exitosa' | 'cancelar'
  const [motivo,     setMotivo]     = useState('')
  const [loading,    setLoading]    = useState(false)
  const [toast,      setToast]      = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const load = () => orderService.getAll().then(setOrders).catch(() => {})
  useEffect(() => { load() }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.estado === filter)

  const handleStatus = async (order, newStatus) => {
    if (newStatus === 'VENTA_EXITOSA') { setSelected(order); setAction('exitosa'); return }
    if (newStatus === 'CANCELADA')     { setSelected(order); setAction('cancelar'); setMotivo(''); return }
    setLoading(true)
    try {
      await orderService.updateStatus(order.id, { estado: newStatus })
      showToast(`Orden ${order.id} → ${newStatus}`)
      load()
    } finally { setLoading(false) }
  }

  const confirmAction = async () => {
    if (action === 'cancelar' && !motivo) return
    setLoading(true)
    try {
      const estado = action === 'exitosa' ? 'VENTA_EXITOSA' : 'CANCELADA'
      await orderService.updateStatus(selected.id, { estado, motivo_cancelacion: motivo })
      showToast(`Orden ${selected.id} → ${estado}`)
      setAction(null); setSelected(null); load()
    } finally { setLoading(false) }
  }

  const counts = STATES.reduce((acc, s) => { acc[s] = orders.filter(o => o.estado === s).length; return acc }, {})

  return (
    <div>
      {toast && <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-brand-600 shadow-lg">{toast}</div>}

      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Gestión de Órdenes</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--tx-3)' }}>Cierre telefónico de cotizaciones</p>
      </div>

      {/* Filtros / contadores */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'all' ? 'bg-brand-600 text-white' : 'hover:bg-brand-500/10'}`}
          style={{ color: filter === 'all' ? undefined : 'var(--tx-2)', border: '1px solid var(--bd-1)' }}>
          Todas ({orders.length})
        </button>
        {STATES.map(s => {
          const cfg = STATE_CONFIG[s]
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filter === s ? cfg.bg : ''}`}
              style={{ color: filter === s ? undefined : 'var(--tx-2)', borderColor: filter === s ? undefined : 'var(--bd-1)' }}>
              {cfg.label} ({counts[s] || 0})
            </button>
          )
        })}
      </div>

      {/* Lista de órdenes */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
            <p style={{ color: 'var(--tx-3)' }}>No hay órdenes en este estado.</p>
          </div>
        )}
        {filtered.map(order => {
          const cfg = STATE_CONFIG[order.estado]
          const isTerminal = ['VENTA_EXITOSA', 'CANCELADA'].includes(order.estado)
          const isExpanded = expandedId === order.id
          const elapsed = Math.round((Date.now() - new Date(order.fecha_creacion).getTime()) / 60000)

          return (
            <div key={order.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
              {/* Header de la orden */}
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-sm text-brand-600 dark:text-brand-300">#{order.id}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bg}`}>{cfg.label}</span>
                    <span className="text-xs" style={{ color: 'var(--tx-3)' }}>{elapsed < 60 ? `hace ${elapsed} min` : formatDate(order.fecha_creacion)}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs" style={{ color: 'var(--tx-2)' }}>
                    <span className="font-semibold">{order.cliente?.nombre}</span>
                    <span className="flex items-center gap-1"><FaPhone size={10}/> {order.cliente?.telefono}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-brand-600 dark:text-brand-300">{formatCOP(order.total_cotizacion)}</p>
                  <p className="text-[10px]" style={{ color: 'var(--tx-3)' }}>{order.items?.length} producto(s)</p>
                </div>
                <FaChevronDown size={12} className={`transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} style={{ color: 'var(--tx-3)' }} />
              </div>

              {/* Detalle expandido */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--bd-1)' }}>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Productos */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--tx-3)' }}>Productos</p>
                      <div className="space-y-1.5">
                        {order.items?.map(item => (
                          <div key={item.producto_id} className="flex justify-between text-xs p-2.5 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
                            <span style={{ color: 'var(--tx-1)' }}>{item.nombre} <span style={{ color: 'var(--tx-3)' }}>×{item.cantidad}</span></span>
                            <span className="font-semibold" style={{ color: 'var(--tx-2)' }}>{formatCOP(item.precio_unitario_momento * item.cantidad)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cliente */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--tx-3)' }}>Cliente</p>
                      <div className="space-y-2 text-xs" style={{ color: 'var(--tx-2)' }}>
                        <p className="font-semibold" style={{ color: 'var(--tx-1)' }}>{order.cliente?.nombre}</p>
                        <p className="flex items-center gap-2"><FaPhone size={10} className="text-brand-500"/> {order.cliente?.telefono}</p>
                        <p className="flex items-center gap-2"><FaEnvelope size={10} className="text-brand-500"/> {order.cliente?.email}</p>
                      </div>
                      {order.motivo_cancelacion && (
                        <div className="mt-3 p-2.5 rounded-xl text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: 'var(--tx-2)' }}>
                          <strong style={{ color: 'var(--tx-1)' }}>Motivo:</strong> {order.motivo_cancelacion}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones de estado */}
                  {!isTerminal && (
                    <div className="px-4 pb-4 flex flex-wrap gap-2">
                      {order.estado === 'PENDIENTE' && (
                        <button onClick={() => handleStatus(order, 'EN_PROCESO')} disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/25 hover:bg-blue-500/25 transition-colors disabled:opacity-50">
                          <FaSpinner size={11}/> Iniciar gestión
                        </button>
                      )}
                      {order.estado === 'EN_PROCESO' && (
                        <button onClick={() => handleStatus(order, 'PENDIENTE')} disabled={loading}
                          className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-500/10 transition-colors border" style={{ color: 'var(--tx-2)', borderColor: 'var(--bd-1)' }}>
                          Volver a Pendiente
                        </button>
                      )}
                      <button onClick={() => handleStatus(order, 'VENTA_EXITOSA')} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-green-500/15 text-green-600 dark:text-green-300 border border-green-500/25 hover:bg-green-500/25 transition-colors disabled:opacity-50">
                        <FaCheckCircle size={11}/> Venta Exitosa
                      </button>
                      <button onClick={() => handleStatus(order, 'CANCELADA')} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/25 hover:bg-red-500/20 transition-colors disabled:opacity-50">
                        <FaTimesCircle size={11}/> Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal Venta Exitosa */}
      <Modal isOpen={action === 'exitosa'} onClose={() => setAction(null)} title="Confirmar Venta Exitosa" size="sm">
        <p className="text-sm mb-5" style={{ color: 'var(--tx-2)' }}>
          ¿Confirmar venta exitosa para la orden <strong className="text-brand-600 dark:text-brand-300">#{selected?.id}</strong>? Esta acción descontará definitivamente el stock reservado y archivará la orden. <strong>No puede revertirse.</strong>
        </p>
        <div className="flex gap-3">
          <button onClick={confirmAction} disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-60">
            {loading ? 'Procesando…' : 'Confirmar Venta Exitosa'}
          </button>
          <button onClick={() => setAction(null)} className="btn-outline flex-1 justify-center">Cancelar</button>
        </div>
      </Modal>

      {/* Modal Cancelar */}
      <Modal isOpen={action === 'cancelar'} onClose={() => setAction(null)} title="Cancelar Orden" size="sm">
        <p className="text-sm mb-4" style={{ color: 'var(--tx-2)' }}>Selecciona el motivo de cancelación (obligatorio):</p>
        <select value={motivo} onChange={e => setMotivo(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none mb-5"
          style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${!motivo && action === 'cancelar' ? 'var(--bd-1)' : 'var(--bd-1)'}`, color: motivo ? 'var(--tx-1)' : 'var(--tx-3)' }}>
          <option value="">Selecciona el motivo…</option>
          {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="flex gap-3">
          <button onClick={confirmAction} disabled={loading || !motivo}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50">
            {loading ? 'Procesando…' : 'Confirmar Cancelación'}
          </button>
          <button onClick={() => setAction(null)} className="btn-outline flex-1 justify-center">Volver</button>
        </div>
      </Modal>
    </div>
  )
}
