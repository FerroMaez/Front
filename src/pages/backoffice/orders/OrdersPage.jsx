import { useState, useEffect, useCallback } from 'react'
import {
  FaPhone, FaEnvelope, FaTimesCircle, FaSpinner, FaChevronDown,
  FaReceipt, FaDownload, FaPlus, FaExternalLinkAlt,
} from 'react-icons/fa'
import { orderService } from '../../../services/api/orderService'
import { productService } from '../../../services/api/productService'
import { formatCOP, formatDate } from '../../../utils/formatters'
import Modal from '../../../components/ui/Modal'
import { websocketService } from '../../../services/api/websocketService'

const STATES  = ['PENDIENTE', 'EN_PROCESO', 'VENTA_EXITOSA', 'CANCELADA']
const MOTIVOS = ['Cliente no contestó', 'Cliente desistió de la compra', 'Producto no disponible a precios acordados', 'Error de cotización', 'Otro']

const STATE_CONFIG = {
  PENDIENTE:      { label: 'Pendiente',     bg: 'bg-yellow-500/10 border-yellow-500/25 text-yellow-600 dark:text-yellow-300' },
  EN_PROCESO:     { label: 'En Proceso',    bg: 'bg-blue-500/10 border-blue-500/25 text-blue-600 dark:text-blue-300' },
  VENTA_EXITOSA:  { label: 'Venta Exitosa', bg: 'bg-green-500/10 border-green-500/25 text-green-600 dark:text-green-300' },
  CANCELADA:      { label: 'Cancelada',     bg: 'bg-red-500/10 border-red-500/25 text-red-500' },
}

const FACTURACION_CONFIG = {
  FACTURADO:         { label: 'Facturado DIAN ✓', bg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-300' },
  ERROR_FACTURACION: { label: 'Error DIAN',        bg: 'bg-orange-500/10 border-orange-500/25 text-orange-600 dark:text-orange-300' },
}

export default function OrdersPage() {
  const [orders,          setOrders]          = useState([])
  const [filter,          setFilter]          = useState('all')
  const [selected,        setSelected]        = useState(null)
  const [action,          setAction]          = useState(null)   // 'aprobar' | 'cancelar'
  const [motivo,          setMotivo]          = useState('')
  const [loading,         setLoading]         = useState(false)
  const [toast,           setToast]           = useState('')
  const [expandedId,      setExpandedId]      = useState(null)
  const [vfOpen,          setVfOpen]          = useState(false)
  const [vfPaso,          setVfPaso]          = useState(1)
  const [productos,       setProductos]       = useState([])
  const [cantidades,      setCantidades]      = useState({})
  const [vfCliente,       setVfCliente]       = useState({ nombre: '', telefono: '', tipoIdentificacion: '', identificacion: '', digitoVerificacion: '', tipoResponsabilidadFiscal: '', codigoMunicipioDane: '', direccion: '', email: '' })
  const [vfErrors,        setVfErrors]        = useState({})
  const [loadingVF,       setLoadingVF]       = useState(false)
  const [exportLoading,   setExportLoading]   = useState(false)

  const load = useCallback(() => orderService.getAll().then(setOrders).catch(() => {}), [])
  useEffect(() => { load() }, [load])

  // Tiempo real: recarga al instante cuando llega una orden nueva via WebSocket.
  // Respaldo: refresca cada 20 s por si el WebSocket no conecta.
  useEffect(() => {
    websocketService.connect()
    const unsub = websocketService.onOrden(load)
    const interval = setInterval(load, 20000)
    return () => { unsub(); clearInterval(interval) }
  }, [load])

  useEffect(() => {
    if (!vfOpen) return
    setVfPaso(1)
    setCantidades({})
    setVfCliente({ nombre: '', telefono: '', tipoIdentificacion: '', identificacion: '', digitoVerificacion: '', tipoResponsabilidadFiscal: '', codigoMunicipioDane: '', direccion: '', email: '' })
    setVfErrors({})
    productService.getAll()
      .then(r => setProductos(r.data.filter(p => p.estado === 'ACTIVO' && p.stock_disponible > 0)))
      .catch(() => {})
  }, [vfOpen])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000) }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.estado === filter)

  const setQty = (id, qty) => setCantidades(prev => {
    if (qty <= 0) { const next = { ...prev }; delete next[id]; return next }
    return { ...prev, [id]: qty }
  })

  const vfItems = Object.entries(cantidades).filter(([, q]) => q > 0).map(([id, cantidad]) => ({ productoId: +id, cantidad }))
  const vfTotal = Object.entries(cantidades).reduce((sum, [id, qty]) => {
    const p = productos.find(pr => pr.id === +id)
    return sum + (p ? p.precio_unitario * qty : 0)
  }, 0)

  const handleStatus = async (order, newStatus) => {
    if (newStatus === 'CANCELADA') { setSelected(order); setAction('cancelar'); setMotivo(''); return }
    setLoading(true)
    try {
      await orderService.updateStatus(order.id, { estado: newStatus })
      showToast(`Orden #${order.id} → ${newStatus}`)
      load()
    } finally { setLoading(false) }
  }

  const handleAprobar = async () => {
    setLoading(true)
    try {
      await orderService.aprobar(selected.id)
      showToast(`Orden #${selected.id} aprobada y facturada correctamente`)
      setAction(null); setSelected(null); load()
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al facturar. Verifique los datos de facturación del cliente.'
      showToast(msg)
      setAction(null); setSelected(null); load()
    } finally { setLoading(false) }
  }

  const handleCancelar = async () => {
    if (!motivo) return
    setLoading(true)
    try {
      await orderService.updateStatus(selected.id, { estado: 'CANCELADA', motivo_cancelacion: motivo })
      showToast(`Orden #${selected.id} cancelada`)
      setAction(null); setSelected(null); load()
    } finally { setLoading(false) }
  }

  const TIPOS_ID_VF = [
    { value: '13', label: 'Cédula (CC)' },
    { value: '31', label: 'NIT' },
    { value: '22', label: 'Cédula extranjería (CE)' },
    { value: '12', label: 'Tarjeta identidad' },
    { value: '91', label: 'CUIL' },
  ]
  const TIPOS_RESP_VF = [
    { value: 'R-99-PN', label: 'No responsable del IVA' },
    { value: 'O-13',    label: 'Gran contribuyente' },
    { value: 'O-15',    label: 'Autorretenedor' },
    { value: 'O-23',    label: 'Agente de retención IVA' },
    { value: 'O-47',    label: 'Régimen simple' },
  ]

  const setCliente = (k) => (e) => setVfCliente(p => ({ ...p, [k]: e.target.value }))

  const validarCliente = () => {
    const e = {}
    if (!vfCliente.nombre.trim())               e.nombre = 'Obligatorio'
    if (!vfCliente.tipoIdentificacion)           e.tipoIdentificacion = 'Selecciona el tipo'
    if (!vfCliente.identificacion.trim())        e.identificacion = 'Obligatorio'
    else if (!/^\d+$/.test(vfCliente.identificacion)) e.identificacion = 'Solo dígitos'
    if (vfCliente.tipoIdentificacion === '31' && !vfCliente.digitoVerificacion.trim())
      e.digitoVerificacion = 'Obligatorio para NIT'
    if (!vfCliente.tipoResponsabilidadFiscal)    e.tipoResponsabilidadFiscal = 'Selecciona el tipo'
    if (!vfCliente.codigoMunicipioDane.trim())   e.codigoMunicipioDane = 'Obligatorio'
    else if (!/^\d{5}$/.test(vfCliente.codigoMunicipioDane)) e.codigoMunicipioDane = 'Debe ser 5 dígitos'
    if (!vfCliente.direccion.trim())             e.direccion = 'Obligatorio'
    setVfErrors(e)
    return Object.keys(e).length === 0
  }

  const handleVentaFisica = async () => {
    if (!validarCliente()) return
    setLoadingVF(true)
    try {
      const cliente = {
        nombre: vfCliente.nombre,
        telefono: vfCliente.telefono || null,
        tipoIdentificacion: vfCliente.tipoIdentificacion,
        identificacion: vfCliente.identificacion,
        digitoVerificacion: vfCliente.tipoIdentificacion === '31' ? vfCliente.digitoVerificacion : null,
        tipoResponsabilidadFiscal: vfCliente.tipoResponsabilidadFiscal,
        codigoMunicipioDane: vfCliente.codigoMunicipioDane,
        direccion: vfCliente.direccion,
        email: vfCliente.email || null,
      }
      const order = await orderService.ventaFisica(vfItems, cliente)
      if (order.facturacion_estado === 'FACTURADO') {
        showToast('Venta física registrada y facturada correctamente')
      } else {
        showToast(`Venta registrada pero hubo un error al facturar: ${order.error_facturacion || 'Error con Dataico'}`)
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Error al registrar la venta física'
      showToast(msg)
    } finally {
      setLoadingVF(false)
      setVfOpen(false)
      load()
    }
  }

  const handleExportExcel = async () => {
    setExportLoading(true)
    try {
      await orderService.exportExcel()
    } catch {
      showToast('Error al exportar el archivo Excel')
    } finally { setExportLoading(false) }
  }

  const counts = STATES.reduce((acc, s) => { acc[s] = orders.filter(o => o.estado === s).length; return acc }, {})

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white shadow-lg max-w-sm"
          style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>
          {toast}
        </div>
      )}

      {/* Cabecera */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Gestión de Órdenes</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--tx-3)' }}>Cierre telefónico y ventas en punto físico</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} disabled={exportLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors hover:bg-green-500/10 disabled:opacity-50"
            style={{ color: 'var(--tx-2)', borderColor: 'var(--bd-1)' }}>
            <FaDownload size={12} className="text-green-600" />
            {exportLoading ? 'Exportando…' : 'Excel'}
          </button>
          <button onClick={() => setVfOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-colors">
            <FaPlus size={11} /> Venta Física
          </button>
        </div>
      </div>

      {/* Filtros */}
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

      {/* Lista */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
            <p style={{ color: 'var(--tx-3)' }}>No hay órdenes en este estado.</p>
          </div>
        )}
        {filtered.map(order => {
          const cfg       = STATE_CONFIG[order.estado]
          const factCfg   = FACTURACION_CONFIG[order.facturacion_estado]
          const isTerminal = ['VENTA_EXITOSA', 'CANCELADA'].includes(order.estado)
          const isExpanded = expandedId === order.id
          const elapsed    = Math.round((Date.now() - new Date(order.fecha_creacion).getTime()) / 60000)

          return (
            <div key={order.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
              {/* Header */}
              <button
                type="button"
                className="flex items-center gap-3 p-4 w-full text-left"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-brand-600 dark:text-brand-300">#{order.id}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bg}`}>{cfg.label}</span>
                    {factCfg && (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${factCfg.bg}`}>{factCfg.label}</span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--tx-3)' }}>
                      {elapsed < 60 ? `hace ${elapsed} min` : formatDate(order.fecha_creacion)}
                    </span>
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
              </button>

              {/* Detalle */}
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

                  {/* Sección facturación electrónica */}
                  {(order.cufe || order.error_facturacion) && (
                    <div className="px-4 pb-4">
                      <div className="p-3.5 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--bd-1)' }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--tx-3)' }}>Facturación Electrónica DIAN</p>
                        {order.cufe && (
                          <p className="text-[11px] font-mono break-all mb-2.5" style={{ color: 'var(--tx-3)' }}>
                            <span className="font-sans font-semibold not-italic" style={{ color: 'var(--tx-2)' }}>CUFE: </span>
                            {order.cufe}
                          </p>
                        )}
                        <div className="flex gap-4">
                          {order.pdf_url && (
                            <a href={order.pdf_url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                              <FaExternalLinkAlt size={10}/> Ver PDF
                            </a>
                          )}
                          {order.xml_url && (
                            <a href={order.xml_url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                              <FaExternalLinkAlt size={10}/> Ver XML
                            </a>
                          )}
                        </div>
                        {order.error_facturacion && (
                          <p className="mt-2 text-xs" style={{ color: 'var(--tx-2)' }}>
                            <span className="font-semibold text-orange-500">Error: </span>
                            {order.error_facturacion}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
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
                      <button onClick={() => { setSelected(order); setAction('aprobar') }} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-green-500/15 text-green-600 dark:text-green-300 border border-green-500/25 hover:bg-green-500/25 transition-colors disabled:opacity-50">
                        <FaReceipt size={11}/> Aprobar + Facturar
                      </button>
                      <button onClick={() => { setSelected(order); setAction('cancelar'); setMotivo('') }} disabled={loading}
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

      {/* Modal Aprobar + Facturar */}
      <Modal isOpen={action === 'aprobar'} onClose={() => setAction(null)} title="Aprobar y Facturar Orden" size="sm">
        <p className="text-sm mb-2" style={{ color: 'var(--tx-2)' }}>
          Se aprobará la orden <strong className="text-brand-600 dark:text-brand-300">#{selected?.id}</strong> y se emitirá la factura electrónica en la DIAN a través de Dataico.
        </p>
        <p className="text-xs mb-5 p-3 rounded-xl" style={{ backgroundColor: 'rgba(140,144,59,0.08)', border: '1px solid rgba(140,144,59,0.2)', color: 'var(--tx-2)' }}>
          El cliente debe tener NIT, tipo de documento y dirección fiscal registrados. Si faltan datos, el sistema mostrará un error.
        </p>
        <div className="flex gap-3">
          <button onClick={handleAprobar} disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-60">
            {loading ? 'Facturando…' : 'Confirmar y Facturar'}
          </button>
          <button onClick={() => setAction(null)} className="btn-outline flex-1 justify-center">Cancelar</button>
        </div>
      </Modal>

      {/* Modal Cancelar */}
      <Modal isOpen={action === 'cancelar'} onClose={() => setAction(null)} title="Cancelar Orden" size="sm">
        <p className="text-sm mb-4" style={{ color: 'var(--tx-2)' }}>Selecciona el motivo de cancelación (obligatorio):</p>
        <select value={motivo} onChange={e => setMotivo(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none mb-5"
          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: motivo ? 'var(--tx-1)' : 'var(--tx-3)' }}>
          <option value="">Selecciona el motivo…</option>
          {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="flex gap-3">
          <button onClick={handleCancelar} disabled={loading || !motivo}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50">
            {loading ? 'Procesando…' : 'Confirmar Cancelación'}
          </button>
          <button onClick={() => setAction(null)} className="btn-outline flex-1 justify-center">Volver</button>
        </div>
      </Modal>

      {/* Modal Venta Física — Paso 1: productos */}
      <Modal isOpen={vfOpen && vfPaso === 1} onClose={() => setVfOpen(false)} title="Nueva Venta Física — Paso 1 de 2" size="lg">
        <p className="text-xs mb-4" style={{ color: 'var(--tx-3)' }}>
          Selecciona los productos y las cantidades que compró el cliente.
        </p>

        {productos.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--tx-3)' }}>Cargando productos…</div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-4">
            {productos.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--bd-1)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--tx-1)' }}>{p.nombre}</p>
                  <p className="text-xs" style={{ color: 'var(--tx-3)' }}>
                    {formatCOP(p.precio_unitario)} · Stock: {p.stock_disponible}
                  </p>
                </div>
                <input type="number" min="0" max={p.stock_disponible}
                  value={cantidades[p.id] || ''} placeholder="0"
                  onChange={e => setQty(p.id, Math.min(Math.max(0, +e.target.value), p.stock_disponible))}
                  className="w-20 px-2 py-1.5 rounded-lg text-sm text-center outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
              </div>
            ))}
          </div>
        )}

        {vfItems.length > 0 && (
          <div className="mb-4 p-3 rounded-xl flex justify-between items-center"
            style={{ backgroundColor: 'rgba(140,144,59,0.08)', border: '1px solid rgba(140,144,59,0.2)' }}>
            <span className="text-sm" style={{ color: 'var(--tx-2)' }}>{vfItems.length} producto(s)</span>
            <span className="font-bold text-brand-600 dark:text-brand-300">{formatCOP(vfTotal)}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => setVfPaso(2)} disabled={vfItems.length === 0}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-50">
            Siguiente → Datos del cliente
          </button>
          <button onClick={() => setVfOpen(false)} className="btn-outline flex-1 justify-center">Cancelar</button>
        </div>
      </Modal>

      {/* Modal Venta Física — Paso 2: datos cliente + resumen */}
      <Modal isOpen={vfOpen && vfPaso === 2} onClose={() => setVfOpen(false)} title="Nueva Venta Física — Paso 2 de 2" size="lg">
        {/* Resumen */}
        <div className="mb-4 rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd-1)' }}>
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--tx-3)' }}>
            Resumen de la venta
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--bd-1)' }}>
            {vfItems.map(({ productoId, cantidad }) => {
              const p = productos.find(pr => pr.id === productoId)
              return p ? (
                <div key={productoId} className="flex justify-between text-xs px-3 py-2" style={{ color: 'var(--tx-2)' }}>
                  <span>{p.nombre} ×{cantidad}</span>
                  <span className="font-semibold">{formatCOP(p.precio_unitario * cantidad)}</span>
                </div>
              ) : null
            })}
          </div>
          <div className="flex justify-between px-3 py-2 font-bold text-sm" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--bd-1)' }}>
            <span style={{ color: 'var(--tx-1)' }}>Total</span>
            <span className="text-brand-600 dark:text-brand-300">{formatCOP(vfTotal)}</span>
          </div>
        </div>

        {/* Formulario datos cliente */}
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--tx-3)' }}>Datos del cliente</p>
        {(() => {
          const inp = (key, label, placeholder, type = 'text') => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--tx-2)' }}>{label}</label>
              <input id={`vf-${key}`} type={type} placeholder={placeholder} value={vfCliente[key]}
                onChange={setCliente(key)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${vfErrors[key] ? '#ef4444' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }} />
              {vfErrors[key] && <p className="mt-0.5 text-xs text-red-500">{vfErrors[key]}</p>}
            </div>
          )
          const sel = (key, label, options) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--tx-2)' }}>{label}</label>
              <select id={`vf-${key}`} value={vfCliente[key]} onChange={setCliente(key)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none appearance-none"
                style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${vfErrors[key] ? '#ef4444' : 'var(--bd-1)'}`, color: vfCliente[key] ? 'var(--tx-1)' : 'var(--tx-3)' }}>
                <option value="">Selecciona…</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {vfErrors[key] && <p className="mt-0.5 text-xs text-red-500">{vfErrors[key]}</p>}
            </div>
          )
          return (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-4">
              {inp('nombre', 'Nombre completo', 'Juan Pérez')}
              {inp('telefono', 'Teléfono', '310 000 0000', 'tel')}
              {sel('tipoIdentificacion', 'Tipo de identificación', TIPOS_ID_VF)}
              {inp('identificacion', 'Número de identificación', 'Ej: 123456789')}
              {vfCliente.tipoIdentificacion === '31' && inp('digitoVerificacion', 'Dígito de verificación', 'Ej: 9')}
              {sel('tipoResponsabilidadFiscal', 'Responsabilidad fiscal', TIPOS_RESP_VF)}
              {inp('codigoMunicipioDane', 'Código DANE (5 dígitos)', 'Ej: 11001')}
              {inp('direccion', 'Dirección', 'Calle 1 # 2-3, Bogotá')}
              {inp('email', 'Email (opcional, para enviar la factura)', 'cliente@email.com', 'email')}
            </div>
          )
        })()}

        <div className="flex gap-3">
          <button onClick={() => setVfPaso(1)} className="btn-outline py-2.5 px-4 text-sm font-bold">
            ← Volver
          </button>
          <button onClick={handleVentaFisica} disabled={loadingVF}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-50">
            {loadingVF ? 'Registrando…' : 'Confirmar Venta Física'}
          </button>
          <button onClick={() => setVfOpen(false)} className="btn-outline py-2.5 px-4 text-sm font-bold">Cancelar</button>
        </div>
      </Modal>
    </div>
  )
}
