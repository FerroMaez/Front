import { useState, useEffect, useCallback } from 'react'
import {
  FaPhone, FaEnvelope, FaTimesCircle, FaSpinner, FaChevronDown,
  FaReceipt, FaDownload, FaPlus, FaExternalLinkAlt, FaSearch, FaIdCard, FaMapMarkerAlt, FaUserCheck,
} from 'react-icons/fa'
import { orderService } from '../../../services/api/orderService'
import { productService } from '../../../services/api/productService'
import { clienteService } from '../../../services/api/clienteService'
import { formatCOP, formatDate, formatDateTime } from '../../../utils/formatters'
import Modal from '../../../components/ui/Modal'
import { websocketService } from '../../../services/api/websocketService'
import { encolarVenta, esErrorDeRed, nuevaClave, ventasOfflineSync } from '../../../services/offline/ventasOfflineSync'
import VentasOfflinePanel from './VentasOfflinePanel'
import { useOfflineStore } from '../../../store/offlineStore'

const CACHE_PRODUCTOS = 'manhid-productos-venta'
const CLIENTE_VACIO = { nombre: '', cedula: '', telefono: '', email: '', direccion: '' }
const etiquetaProducto = (p) => `${p.nombre}${p.pulgadas ? ` ${p.pulgadas}` : ''}`

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
  const [tiposPrecio,     setTiposPrecio]     = useState({})   // { [productoId]: 'ECONOMICO' | 'PESADO' }
  const [vfCliente,       setVfCliente]       = useState(CLIENTE_VACIO)
  const [vfClienteId,     setVfClienteId]     = useState(null)    // cliente guardado elegido
  const [vfBuscaCliente,  setVfBuscaCliente]  = useState('')
  const [vfSugerencias,   setVfSugerencias]   = useState([])
  const [productoFiltro,  setProductoFiltro]  = useState('')      // historial por producto
  const [productosFiltro, setProductosFiltro] = useState([])
  const [vfDescripcion,   setVfDescripcion]   = useState('')
  const [vfPagado,        setVfPagado]        = useState('')
  const [vfBusqueda,      setVfBusqueda]      = useState('')
  const [vfErrors,        setVfErrors]        = useState({})
  const [loadingVF,       setLoadingVF]       = useState(false)
  const [exportLoading,   setExportLoading]   = useState(false)

  const load = useCallback(
    () => orderService.getAll({ productoId: productoFiltro }).then(setOrders).catch(() => {}),
    [productoFiltro])
  useEffect(() => { load() }, [load])

  // Productos para el filtro de historial (todos los de Inventario, por nombre y medida)
  useEffect(() => {
    productService.getAll({ tipoInventario: 'INVENTARIO' })
      .then(r => setProductosFiltro([...r.data].sort((a, b) =>
        etiquetaProducto(a).localeCompare(etiquetaProducto(b), 'es', { numeric: true, sensitivity: 'base' }))))
      .catch(() => {})
  }, [])

  // Clientes guardados: sugerencias mientras se escribe (o los más recientes al abrir el paso 2)
  useEffect(() => {
    if (!vfOpen || vfPaso !== 2) return
    const t = setTimeout(() => {
      clienteService.buscar(vfBuscaCliente.trim()).then(setVfSugerencias).catch(() => setVfSugerencias([]))
    }, 250)
    return () => clearTimeout(t)
  }, [vfBuscaCliente, vfOpen, vfPaso])

  // Tiempo real: recarga al instante cuando llega una orden nueva via WebSocket.
  // Respaldo: refresca cada 20 s por si el WebSocket no conecta.
  useEffect(() => {
    websocketService.connect()
    const unsub = websocketService.onOrden(load)
    const unsubOffline = ventasOfflineSync.onResultado(load)   // venta offline ya registrada
    const interval = setInterval(load, 20000)
    return () => { unsub(); unsubOffline(); clearInterval(interval) }
  }, [load])

  useEffect(() => {
    if (!vfOpen) return
    setVfPaso(1)
    setCantidades({})
    setTiposPrecio({})
    setVfCliente(CLIENTE_VACIO)
    setVfClienteId(null)
    setVfBuscaCliente('')
    setVfDescripcion('')
    setVfPagado('')
    setVfBusqueda('')
    setVfErrors({})
    // Se guarda una copia del catálogo para poder vender aunque se caiga el internet.
    productService.getAll()
      .then(r => {
        const activos = r.data.filter(p => p.estado === 'ACTIVO' && p.stock_disponible > 0)
        setProductos(activos)
        try { localStorage.setItem(CACHE_PRODUCTOS, JSON.stringify(activos)) } catch (_) {}
      })
      .catch(() => {
        try { setProductos(JSON.parse(localStorage.getItem(CACHE_PRODUCTOS) || '[]')) } catch (_) {}
      })
  }, [vfOpen])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000) }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.estado === filter)

  const setQty = (id, qty) => setCantidades(prev => {
    if (qty <= 0) { const next = { ...prev }; delete next[id]; return next }
    return { ...prev, [id]: qty }
  })

  // Unidades ya comprometidas en ventas offline que aún no llegan al backend (el stock del
  // servidor todavía no las descuenta). Las rechazadas no cuentan: esas no se registraron.
  const ventasOffline = useOfflineStore(s => s.ventas)
  const reservadoOffline = ventasOffline
    .filter(v => v.estado !== 'RECHAZADA')
    .flatMap(v => v.venta.items)
    .reduce((acc, i) => ({ ...acc, [i.productoId]: (acc[i.productoId] || 0) + i.cantidad }), {})
  // Lo que realmente se puede vender: físico − reservado para cotizaciones − ventas offline pendientes
  const stockVendible = (p) => Math.max(0,
    (p.stock_disponible ?? 0) - (p.stock_reservado ?? 0) - (reservadoOffline[p.id] || 0))

  // Buscador de la venta física: por nombre o medida, sin importar tildes ni mayúsculas.
  const normalizar = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
  const textoVf = normalizar(vfBusqueda)
  const productosVisibles = textoVf
    ? productos.filter(p => normalizar(`${p.nombre} ${p.pulgadas || ''}`).includes(textoVf))
    : productos

  // Cada producto se vende al precio económico (por defecto) o al pesado.
  const tipoPrecioDe = (id) => tiposPrecio[id] || 'ECONOMICO'
  const tienePesado = (p) => Number(p?.precio_pesado) > 0
  const precioDe = (p) => (tipoPrecioDe(p.id) === 'PESADO' && tienePesado(p) ? Number(p.precio_pesado) : p.precio_unitario)

  const vfItems = Object.entries(cantidades).filter(([, q]) => q > 0)
    .map(([id, cantidad]) => ({ productoId: +id, cantidad, tipoPrecio: tipoPrecioDe(+id) }))
  const vfTotal = Object.entries(cantidades).reduce((sum, [id, qty]) => {
    const p = productos.find(pr => pr.id === +id)
    return sum + (p ? precioDe(p) * qty : 0)
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

  const setCliente = (k) => (e) => setVfCliente(p => ({ ...p, [k]: e.target.value }))
  const elegirCliente = (c) => {
    setVfCliente({ nombre: c.nombre, cedula: c.cedula, telefono: c.telefono, email: c.email, direccion: c.direccion })
    setVfClienteId(c.id)
    setVfBuscaCliente('')
    setVfErrors(er => ({ ...er, nombre: '', email: '' }))
  }
  const quitarCliente = () => { setVfCliente(CLIENTE_VACIO); setVfClienteId(null) }

  const validarCliente = () => {
    const e = {}
    if (!vfCliente.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (vfCliente.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vfCliente.email.trim())) e.email = 'Correo no válido'
    if (vfPagado === '' || Number(vfPagado) <= 0) e.pagado = 'Ingresa cuánto pagó el cliente'
    setVfErrors(e)
    return Object.keys(e).length === 0
  }

  const handleVentaFisica = async () => {
    if (!validarCliente()) return
    setLoadingVF(true)
    try {
      const cliente = {
        nombre: vfCliente.nombre.trim(),
        cedula: vfCliente.cedula.trim() || null,
        telefono: vfCliente.telefono.trim() || null,
        email: vfCliente.email.trim() || null,
        direccion: vfCliente.direccion.trim() || null,
        clienteId: vfClienteId,
      }
      const clave = nuevaClave()
      const totalPagado = Number(vfPagado)
      const items = vfItems.map(i => ({ productoId: i.productoId, cantidad: i.cantidad, tipoPrecio: i.tipoPrecio }))
      try {
        const venta = await orderService.ventaFisica(items, cliente, vfDescripcion, clave, totalPagado)
        setOrders(prev => [venta, ...prev.filter(o => o.id !== venta.id)])
        setFilter('all')
        showToast('Venta física registrada correctamente')
      } catch (err) {
        if (!esErrorDeRed(err)) throw err
        // Sin internet (o se cortó a mitad): se guarda en la cola local con la MISMA clave.
        // Si la venta sí alcanzó a llegar, al sincronizar el backend la detecta como duplicada.
        await encolarVenta({ clave, items, cliente, descripcion: vfDescripcion, totalPagado })
        showToast('📴 Sin conexión: la venta quedó guardada y se enviará sola al volver el internet')
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

      {/* Ventas hechas sin internet, pendientes de sincronizar o rechazadas */}
      <VentasOfflinePanel />

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

      {/* Historial por producto */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor="filtro-producto" className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--tx-3)' }}>
          Producto
        </label>
        <select id="filtro-producto" value={productoFiltro} onChange={e => { setProductoFiltro(e.target.value); setFilter('all'); setExpandedId(null) }}
          className="flex-1 min-w-0 sm:flex-none sm:w-96 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${productoFiltro ? 'rgba(140,144,59,0.6)' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }}>
          <option value="">Todos los productos</option>
          {productosFiltro.map(p => (
            <option key={p.id} value={p.id}>{etiquetaProducto(p)}{p.estado !== 'ACTIVO' ? ' (inactivo)' : ''}</option>
          ))}
        </select>
        {productoFiltro && (
          <button onClick={() => setProductoFiltro('')} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            Quitar filtro
          </button>
        )}
      </div>
      {productoFiltro && (() => {
        const id = Number(productoFiltro)
        const vendidas = orders.filter(o => o.estado === 'VENTA_EXITOSA')
        const lineas = vendidas.flatMap(o => o.items.filter(i => i.producto_id === id))
        const unidades = lineas.reduce((s, i) => s + i.cantidad, 0)
        const valor = lineas.reduce((s, i) => s + i.precio_unitario_momento * i.cantidad, 0)
        const p = productosFiltro.find(x => x.id === id)
        return (
          <div className="mb-4 p-3 rounded-xl text-sm flex flex-wrap gap-x-6 gap-y-1"
            style={{ backgroundColor: 'rgba(140,144,59,0.08)', border: '1px solid rgba(140,144,59,0.2)', color: 'var(--tx-2)' }}>
            <span>Historial de <strong style={{ color: 'var(--tx-1)' }}>{p ? etiquetaProducto(p) : 'producto'}</strong></span>
            <span><strong style={{ color: 'var(--tx-1)' }}>{orders.length}</strong> orden(es)</span>
            <span><strong style={{ color: 'var(--tx-1)' }}>{unidades}</strong> und. vendidas en {vendidas.length} venta(s) exitosa(s)</span>
            <span>Valor de productos: <strong className="text-brand-600 dark:text-brand-300">{formatCOP(valor)}</strong></span>
          </div>
        )
      })()}

      {/* Lista */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
            <p style={{ color: 'var(--tx-3)' }}>{productoFiltro ? 'Este producto no tiene órdenes en este estado.' : 'No hay órdenes en este estado.'}</p>
          </div>
        )}
        {filtered.map(order => {
          const cfg       = STATE_CONFIG[order.estado]
          const factCfg   = order.es_venta_fisica ? null : FACTURACION_CONFIG[order.facturacion_estado]
          const isTerminal = ['VENTA_EXITOSA', 'CANCELADA'].includes(order.estado)
          const isExpanded = expandedId === order.id
          const elapsed    = Math.round((Date.now() - new Date(order.fecha_creacion).getTime()) / 60000)
          const vendida    = order.estado === 'VENTA_EXITOSA'
          const pagado     = order.total_pagado ?? order.total_cotizacion
          // Venta física: la hora real de la venta (también si se hizo sin internet). En línea: cuando se facturó.
          const fechaPago  = order.es_venta_fisica ? order.fecha_creacion : (order.fecha_cierre || order.fecha_creacion)

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
                  {vendida ? (
                    <>
                      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tx-3)' }}>Pagado</p>
                      <p className="font-bold text-brand-600 dark:text-brand-300">{formatCOP(pagado)}</p>
                      <p className="text-[10px]" style={{ color: 'var(--tx-3)' }}>{formatDateTime(fechaPago)}</p>
                    </>
                  ) : (
                    <p className="font-bold text-brand-600 dark:text-brand-300">{formatCOP(order.total_cotizacion)}</p>
                  )}
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
                            <span style={{ color: 'var(--tx-1)' }}>
                              <span className={productoFiltro && item.producto_id === Number(productoFiltro) ? 'font-bold' : undefined}>{item.nombre}{item.pulgadas ? ` ${item.pulgadas}` : ''}</span> <span style={{ color: 'var(--tx-3)' }}>×{item.cantidad}</span>
                              {item.tipo_precio && (
                                <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tx-3)' }}>
                                  · {item.tipo_precio === 'PESADO' ? 'Pesado' : 'Económico'}
                                </span>
                              )}
                            </span>
                            <span className="font-semibold" style={{ color: 'var(--tx-2)' }}>{formatCOP(item.precio_unitario_momento * item.cantidad)}</span>
                          </div>
                        ))}
                      </div>
                      {vendida && order.total_pagado != null && order.total_pagado !== order.total_cotizacion && (
                        <div className="mt-2 space-y-1 text-xs px-2.5">
                          <div className="flex justify-between" style={{ color: 'var(--tx-3)' }}>
                            <span>Total productos</span><span>{formatCOP(order.total_cotizacion)}</span>
                          </div>
                          <div className="flex justify-between font-bold" style={{ color: 'var(--tx-1)' }}>
                            <span>Pagado</span><span>{formatCOP(order.total_pagado)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cliente */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--tx-3)' }}>Cliente</p>
                      <div className="space-y-2 text-xs" style={{ color: 'var(--tx-2)' }}>
                        <p className="font-semibold" style={{ color: 'var(--tx-1)' }}>{order.cliente?.nombre}</p>
                        <p className="flex items-center gap-2"><FaPhone size={10} className="text-brand-500"/> {order.cliente?.telefono}</p>
                        <p className="flex items-center gap-2"><FaEnvelope size={10} className="text-brand-500"/> {order.cliente?.email}</p>
                        {order.cliente?.cedula && <p className="flex items-center gap-2"><FaIdCard size={10} className="text-brand-500"/> {order.cliente.cedula}</p>}
                        {order.cliente?.direccion && <p className="flex items-center gap-2"><FaMapMarkerAlt size={10} className="text-brand-500"/> {order.cliente.direccion}</p>}
                      </div>
                      {order.es_venta_fisica && order.descripcion && (
                        <div className="mt-3 p-2.5 rounded-xl text-xs" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--tx-2)' }}>
                          <strong style={{ color: 'var(--tx-1)' }}>Descripción de la venta:</strong> {order.descripcion}
                        </div>
                      )}
                      {order.motivo_cancelacion && (
                        <div className="mt-3 p-2.5 rounded-xl text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: 'var(--tx-2)' }}>
                          <strong style={{ color: 'var(--tx-1)' }}>Motivo:</strong> {order.motivo_cancelacion}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sección facturación electrónica */}
                  {!order.es_venta_fisica && (order.cufe || order.error_facturacion) && (
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

        <div className="relative mb-3">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={12} style={{ color: 'var(--tx-3)' }} />
          <input type="search" value={vfBusqueda} onChange={e => setVfBusqueda(e.target.value)}
            placeholder="¿No lo encuentras? Escribe el nombre o la medida…" aria-label="Buscar producto"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
        </div>

        {productos.length === 0 && (
          <div className="text-center py-8" style={{ color: 'var(--tx-3)' }}>Cargando productos…</div>
        )}
        {productos.length > 0 && productosVisibles.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--tx-3)' }}>
            No hay productos que coincidan con &quot;{vfBusqueda}&quot;.
          </div>
        )}
        {productosVisibles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1 mb-4">
            {productosVisibles.map(p => {
              const stock = stockVendible(p)
              const bajo  = stock <= (p.stock_minimo ?? 0)
              return (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: cantidades[p.id] ? 'rgba(140,144,59,0.5)' : 'var(--bd-1)', opacity: stock > 0 ? 1 : 0.5 }}>
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
                  <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain p-1" onError={e => { e.target.src = '/newLogo3.jpeg' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--tx-1)' }}>
                    {p.nombre}
                    {p.pulgadas && <span className="ml-1.5 text-xs font-medium" style={{ color: 'var(--tx-3)' }}>{p.pulgadas}</span>}
                  </p>
                  <p className={`text-xs font-semibold mt-0.5 ${bajo ? 'text-orange-500' : 'text-green-600 dark:text-green-400'}`}>
                    Stock: {stock} und.{bajo && stock > 0 ? ' · bajo' : ''}{stock === 0 ? ' · agotado' : ''}
                  </p>
                  {(reservadoOffline[p.id] || 0) > 0 && (
                    <p className="text-[11px]" style={{ color: 'var(--tx-3)' }}>
                      {reservadoOffline[p.id]} und. en ventas sin sincronizar
                    </p>
                  )}
                  {p.condicion === 'REMANUFACTURADO' ? (
                    <p className="mt-1.5 text-[11px] font-semibold" style={{ color: 'var(--tx-2)' }}>
                      Remanufacturado · {formatCOP(p.precio_unitario)}
                    </p>
                  ) : (
                  <div role="radiogroup" aria-label={'Precio de ' + p.nombre} className="mt-1.5 inline-flex rounded-lg overflow-hidden text-[11px] font-semibold"
                    style={{ border: '1px solid var(--bd-1)' }}>
                    {[['ECONOMICO', 'Económico', p.precio_unitario, true], ['PESADO', 'Pesado', p.precio_pesado, tienePesado(p)]].map(([valor, etiqueta, precio, habilitado]) => {
                      const activo = tipoPrecioDe(p.id) === valor
                      return (
                        <button key={valor} type="button" role="radio" aria-checked={activo} disabled={!habilitado || stock === 0}
                          title={habilitado ? undefined : 'Este producto no tiene precio pesado'}
                          onClick={() => setTiposPrecio(t => ({ ...t, [p.id]: valor }))}
                          className={`px-2 py-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${activo ? 'bg-brand-600 text-white' : 'hover:bg-brand-500/10'}`}
                          style={activo ? undefined : { color: 'var(--tx-2)' }}>
                          {etiqueta} {habilitado ? formatCOP(precio) : '—'}
                        </button>
                      )
                    })}
                  </div>
                  )}
                </div>
                <input aria-label={'Cantidad de ' + p.nombre} type="number" min="0" max={stock} step="1"
                  value={cantidades[p.id] || ''} placeholder="0" disabled={stock === 0}
                  onChange={e => setQty(p.id, Math.min(Math.max(0, +e.target.value), stock))}
                  className="w-20 px-2 py-1.5 rounded-lg text-sm text-center outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
              </div>
              )
            })}
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
            {vfItems.map(({ productoId, cantidad, tipoPrecio }) => {
              const p = productos.find(pr => pr.id === productoId)
              return p ? (
                <div key={productoId} className="flex justify-between text-xs px-3 py-2" style={{ color: 'var(--tx-2)' }}>
                  <span>
                    {p.nombre}{p.pulgadas ? ` ${p.pulgadas}` : ''} ×{cantidad}
                    <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tx-3)' }}>
                      · {p.condicion === 'REMANUFACTURADO' ? 'Remanufacturado' : tipoPrecio === 'PESADO' ? 'Pesado' : 'Económico'}
                    </span>
                  </span>
                  <span className="font-semibold">{formatCOP(precioDe(p) * cantidad)}</span>
                </div>
              ) : null
            })}
          </div>
          <div className="flex justify-between px-3 py-2 font-bold text-sm" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--bd-1)' }}>
            <span style={{ color: 'var(--tx-1)' }}>Total</span>
            <span className="text-brand-600 dark:text-brand-300">{formatCOP(vfTotal)}</span>
          </div>
          <div className="px-3 py-2.5" style={{ borderTop: '1px solid var(--bd-1)' }}>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="vf-pagado" className="text-sm font-bold" style={{ color: 'var(--tx-1)' }}>
                Pagado <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setVfPagado(String(vfTotal)); setVfErrors(er => ({ ...er, pagado: '' })) }}
                  className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline whitespace-nowrap">
                  Igual al total
                </button>
                <input id="vf-pagado" type="number" min="0" step="1" inputMode="numeric" placeholder="0"
                  value={vfPagado}
                  onChange={e => { setVfPagado(e.target.value); setVfErrors(er => ({ ...er, pagado: '' })) }}
                  className="w-36 px-3 py-1.5 rounded-xl text-sm text-right font-bold outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid ' + (vfErrors.pagado ? '#ef4444' : 'var(--bd-1)'), color: 'var(--tx-1)' }} />
              </div>
            </div>
            {vfErrors.pagado && <p className="mt-1 text-xs text-red-500 text-right">{vfErrors.pagado}</p>}
            {vfPagado !== '' && Number(vfPagado) > 0 && Number(vfPagado) !== vfTotal && (
              <p className="mt-1 text-[11px] text-right" style={{ color: 'var(--tx-3)' }}>
                {Number(vfPagado) < vfTotal ? 'Descuento' : 'Adicional'} de {formatCOP(Math.abs(vfTotal - Number(vfPagado)))} sobre el total
              </p>
            )}
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--tx-3)' }}>Datos del cliente</p>
        {vfClienteId ? (
          <div className="mb-3 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs"
            style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: 'var(--tx-2)' }}>
            <span className="flex items-center gap-2"><FaUserCheck className="text-green-600" size={12} />
              Cliente guardado. Si cambias algún dato, se actualiza para las próximas ventas.</span>
            <button type="button" onClick={quitarCliente} className="font-semibold text-brand-600 dark:text-brand-400 hover:underline whitespace-nowrap">
              Otro cliente
            </button>
          </div>
        ) : (
          <div className="relative mb-3">
            <FaSearch className="absolute left-3 top-[1.15rem] -translate-y-1/2" size={12} style={{ color: 'var(--tx-3)' }} />
            <input type="search" value={vfBuscaCliente} onChange={e => setVfBuscaCliente(e.target.value)}
              placeholder="Buscar cliente guardado por nombre, cédula o teléfono…" aria-label="Buscar cliente guardado"
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
            {vfSugerencias.length > 0 && (
              <ul role="listbox" aria-label="Clientes guardados" className="mt-1.5 max-h-40 overflow-y-auto rounded-xl divide-y"
                style={{ border: '1px solid var(--bd-1)', backgroundColor: 'var(--bg-surface)', borderColor: 'var(--bd-1)' }}>
                {vfSugerencias.map(c => (
                  <li key={c.id}>
                    <button type="button" role="option" aria-selected="false" onClick={() => elegirCliente(c)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-brand-500/10 transition-colors">
                      <span className="font-semibold" style={{ color: 'var(--tx-1)' }}>{c.nombre}</span>
                      <span className="ml-2" style={{ color: 'var(--tx-3)' }}>
                        {[c.cedula && `C.C. ${c.cedula}`, c.telefono, c.email].filter(Boolean).join(' · ')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {vfBuscaCliente.trim() && vfSugerencias.length === 0 && (
              <p className="mt-1 text-[11px]" style={{ color: 'var(--tx-3)' }}>No hay clientes guardados con ese dato. Llena los campos y se guardará con la venta.</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 mb-4">
          {[['nombre', 'Nombre completo *', 'Nombre del cliente', 'text'], ['cedula', 'Cédula (opcional)', '1020304050', 'text'],
            ['telefono', 'Teléfono (opcional)', '310 000 0000', 'tel'], ['email', 'Correo (opcional)', 'cliente@email.com', 'email'],
            ['direccion', 'Dirección (opcional)', 'Calle 10 # 20-30', 'text']].map(([key, label, placeholder, type]) => (
            <div key={key} className={key === 'direccion' ? 'sm:col-span-2' : undefined}>
              <label htmlFor={'vf-' + key} className="block text-xs font-medium mb-1" style={{ color: 'var(--tx-2)' }}>{label}</label>
              <input id={'vf-' + key} type={type} placeholder={placeholder} value={vfCliente[key]} onChange={setCliente(key)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid ' + (vfErrors[key] ? '#ef4444' : 'var(--bd-1)'), color: 'var(--tx-1)' }} />
              {vfErrors[key] && <p className="mt-0.5 text-xs text-red-500">{vfErrors[key]}</p>}
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label htmlFor="vf-descripcion" className="block text-xs font-medium mb-1" style={{ color: 'var(--tx-2)' }}>Descripción de la venta (opcional)</label>
          <textarea id="vf-descripcion" rows={3} maxLength={2000} value={vfDescripcion} onChange={e => setVfDescripcion(e.target.value)}
            placeholder="Agrega detalles o notas de esta venta..."
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-y"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
        </div>


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
