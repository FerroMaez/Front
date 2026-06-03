import { useState, useEffect, useCallback } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle, FaChevronRight, FaCheckCircle } from 'react-icons/fa'
import { productService } from '../../../services/api/productService'
import { LINEAS_SERVICIO } from '../../../features/catalog/mockProducts'
import { catalogProducts } from '../../../features/catalog/catalogData'
import { formatCOP } from '../../../utils/formatters'
import Modal from '../../../components/ui/Modal'
import StockBadge from '../../../components/shared/StockBadge'

const RAZONES = [
  'Entrada por proveedor', 'Ajuste por merma o daño', 'Venta telefónica manual',
  'Devolución de cliente', 'Corrección de conteo físico', 'Otro',
]

const emptyForm = {
  linea_servicio: '', nombre: '', imagen_url: '',
  descripcion: '', precio_unitario: '', stock_disponible: '', stock_minimo: '',
  estado: 'ACTIVO',
}

// ── Funciones puras (fuera del componente para reducir complejidad cognitiva) ──
function subcatsForLinea(lineaValue) {
  const linea = LINEAS_SERVICIO.find(l => l.value === lineaValue)
  if (!linea) return []
  return catalogProducts.find(cp => cp.slug === linea.slug)?.subcategorias ?? []
}

function buildErrors(form) {
  const e = {}
  if (!form.linea_servicio)                                          e.linea_servicio  = 'Selecciona la línea de servicio'
  if (!form.nombre)                                                  e.nombre          = 'Selecciona el producto del catálogo'
  if (!form.precio_unitario || Number(form.precio_unitario) <= 0)    e.precio_unitario = 'Precio inválido'
  if (form.stock_disponible === '' || Number(form.stock_disponible) < 0) e.stock_disponible = 'Stock inválido'
  if (form.stock_minimo     === '' || Number(form.stock_minimo)     < 0) e.stock_minimo     = 'Stock mínimo inválido'
  return e
}

export default function InventoryPage() {
  const [products,    setProducts]    = useState([])
  const [search,      setSearch]      = useState('')
  const [lineaFiltro, setLineaFiltro] = useState('')
  const [modal,       setModal]       = useState(null)   // null | 'create' | 'edit' | 'delete'
  const [selected,    setSelected]    = useState(null)
  const [form,        setForm]        = useState(emptyForm)
  const [errors,      setErrors]      = useState({})
  const [stockChange, setStockChange] = useState(false)
  const [razon,       setRazon]       = useState('')
  const [razonOtro,   setRazonOtro]   = useState('')
  const [loading,     setLoading]     = useState(false)
  const [toast,       setToast]       = useState('')

  const load = useCallback(async () => {
    const { data } = await productService.getAll({ search })
    const filtered = lineaFiltro ? data.filter(p => p.linea_servicio === lineaFiltro) : data
    setProducts(filtered)
  }, [search, lineaFiltro])

  useEffect(() => { load() }, [load])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const openCreate = () => {
    setForm(emptyForm); setErrors({}); setRazon(''); setRazonOtro('')
    setModal('create')
  }

  const openEdit = (p) => {
    setSelected(p)
    setForm({
      linea_servicio:   p.linea_servicio  || '',
      nombre:           p.nombre          || '',
      imagen_url:       p.imagen_url      || '',
      descripcion:      p.descripcion     || '',
      precio_unitario:  String(p.precio_unitario),
      stock_disponible: String(p.stock_disponible),
      stock_minimo:     String(p.stock_minimo),
      estado:           p.estado          || 'ACTIVO',
    })
    setErrors({}); setStockChange(false); setRazon(''); setRazonOtro('')
    setModal('edit')
  }

  const openDelete = (p) => { setSelected(p); setModal('delete') }

  // Al seleccionar un producto del catálogo → auto-asigna nombre + imagen
  const handleSelectSubcat = (subcat) => {
    setForm(f => ({ ...f, nombre: subcat.nombre, imagen_url: subcat.imagen }))
    setErrors(e => ({ ...e, nombre: '' }))
  }

  const handleStockChange = (val) => {
    setForm(f => ({ ...f, stock_disponible: val }))
    if (modal === 'edit') setStockChange(String(val) !== String(selected?.stock_disponible))
  }

  const validate = () => {
    const e = buildErrors(form)
    const stockReasonMissing = modal === 'edit' && stockChange && !razon
    if (stockReasonMissing) e.razon = 'La razón del cambio es obligatoria.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const linea = LINEAS_SERVICIO.find(l => l.value === form.linea_servicio)
      const payload = {
        ...form,
        categoria:        form.linea_servicio,
        precio_unitario:  Number(form.precio_unitario),
        stock_disponible: Number(form.stock_disponible),
        stock_minimo:     Number(form.stock_minimo),
        linea_label:      linea?.label || '',
      }
      if (modal === 'create') {
        await productService.create(payload)
        showToast('Producto creado exitosamente.')
      } else {
        await productService.update(selected.id, { ...payload, razon_stock: razon || razonOtro })
        showToast('Producto actualizado correctamente.')
      }
      setModal(null); load()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (selected?.stock_reservado > 0) return
    setLoading(true)
    try {
      await productService.delete(selected.id)
      showToast('Producto desactivado.')
      setModal(null); load()
    } finally {
      setLoading(false)
    }
  }

  const currentSubcats = subcatsForLinea(form.linea_servicio)

  // Etiqueta de guardado (sin ternarios anidados)
  let saveLabel = 'Guardar cambios'
  if (loading)              saveLabel = 'Guardando…'
  else if (modal === 'create') saveLabel = 'Crear producto'

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-brand-600 shadow-lg animate-fadein">
          {toast}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Inventario</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--tx-3)' }}>{products.length} productos registrados</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm gap-2">
          <FaPlus size={12} /> Agregar producto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={12} style={{ color: 'var(--tx-3)' }} />
          <input placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none w-48 transition-colors"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
        </div>
        <select value={lineaFiltro} onChange={e => setLineaFiltro(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm outline-none appearance-none"
          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>
          <option value="">Todas las líneas</option>
          {LINEAS_SERVICIO.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--bd-1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--bd-1)' }}>
                {['Producto', 'Línea de servicio', 'Precio', 'Stock', 'Estado', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--tx-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--tx-3)' }}>
                    No hay productos registrados aún. Haz clic en <strong>&quot;Agregar producto&quot;</strong> para comenzar.
                  </td>
                </tr>
              )}
              {products.map((p, i) => {
                const linea = LINEAS_SERVICIO.find(l => l.value === (p.linea_servicio || p.categoria))
                return (
                  <tr key={p.id}
                    style={{ borderBottom: i < products.length - 1 ? '1px solid var(--bd-1)' : 'none', backgroundColor: 'var(--bg-raised)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--bd-1)' }}>
                          <img src={p.imagen_url} alt={p.nombre}
                            className="w-full h-full object-contain p-1"
                            onError={e => { e.target.src = '/newLogo3.jpeg' }} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--tx-1)' }}>{p.nombre}</p>
                          {p.stock_reservado > 0 && <p className="text-[10px] text-yellow-600 dark:text-yellow-400">{p.stock_reservado} reservado(s)</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {linea && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border"
                          style={{ backgroundColor: linea.color, borderColor: linea.colorBorder, color: 'var(--tx-1)' }}>
                          {linea.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-sm text-brand-600 dark:text-brand-300">{formatCOP(p.precio_unitario)}</td>
                    <td className="px-4 py-3"><StockBadge disponible={p.stock_disponible} minimo={p.stock_minimo} showCount /></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.estado === 'ACTIVO' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25' : 'bg-red-500/10 text-red-500 border-red-500/25'}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-brand-500/10 transition-colors text-brand-500"><FaEdit size={13} /></button>
                        <button onClick={() => openDelete(p)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-500"><FaTrash size={13} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MODAL CREAR / EDITAR
      ═══════════════════════════════════════════ */}
      <Modal isOpen={modal === 'create' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Agregar Producto al Inventario' : `Editar: ${selected?.nombre}`}
        size="lg">
        <div className="space-y-6">

          {/* ── PASO 1: Línea de servicio ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--tx-3)' }}>
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">1</span>
              Línea de servicio
              {errors.linea_servicio && <span className="text-red-500 font-normal normal-case">{errors.linea_servicio}</span>}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LINEAS_SERVICIO.map(l => {
                const isActive = form.linea_servicio === l.value
                return (
                  <button key={l.value} type="button"
                    disabled={modal === 'edit'}
                    onClick={() => {
                      setForm(f => ({ ...f, linea_servicio: l.value, nombre: '', imagen_url: '' }))
                      setErrors(e => ({ ...e, linea_servicio: '', nombre: '' }))
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isActive ? l.color : 'var(--bg-surface)',
                      borderColor:     isActive ? l.colorBorder : 'var(--bd-1)',
                      color:           isActive ? 'var(--tx-1)' : 'var(--tx-2)',
                      opacity:         modal === 'edit' ? 0.7 : 1,
                      boxShadow:       isActive ? `0 2px 12px -2px ${l.colorBorder}` : 'none',
                    }}>
                    <img src={`/servicios/${l.folder}/logo.jpeg`} alt={l.label}
                      className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
                      onError={e => { e.target.src = '/newLogo3.jpeg' }} />
                    {l.label}
                    {isActive && <FaCheckCircle size={11} className="ml-auto flex-shrink-0 text-brand-500" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── PASO 2: Producto del catálogo (solo en crear) ── */}
          {modal === 'create' && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--tx-3)' }}>
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">2</span>
                Producto del catálogo
                {errors.nombre && <span className="text-red-500 font-normal normal-case">{errors.nombre}</span>}
              </p>

              {!form.linea_servicio ? (
                <div className="flex items-center gap-2 p-4 rounded-xl text-sm" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--tx-3)' }}>
                  <FaChevronRight size={12} className="text-brand-500" />
                  Primero selecciona una línea de servicio para ver los productos disponibles
                </div>
              ) : (
                <>
                  {/* Grid de productos de la línea */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                    {currentSubcats.map(sub => {
                      const isSelected = form.nombre === sub.nombre
                      return (
                        <button key={sub.id} type="button"
                          onClick={() => handleSelectSubcat(sub)}
                          className="flex items-center gap-2 p-2.5 rounded-xl text-left text-xs font-medium transition-all border"
                          style={{
                            backgroundColor: isSelected ? 'rgba(140,144,59,0.12)' : 'var(--bg-surface)',
                            borderColor:     isSelected ? 'rgba(140,144,59,0.5)' : 'var(--bd-1)',
                            color:           isSelected ? 'var(--tx-1)' : 'var(--tx-2)',
                            boxShadow:       isSelected ? '0 2px 8px -2px rgba(140,144,59,0.2)' : 'none',
                          }}>
                          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
                            style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
                            <img src={sub.imagen} alt={sub.nombre}
                              className="w-full h-full object-contain p-0.5"
                              onError={e => { e.target.src = '/newLogo3.jpeg' }} />
                          </div>
                          <span className="leading-snug">{sub.nombre}</span>
                          {isSelected && <FaCheckCircle size={11} className="ml-auto flex-shrink-0 text-brand-500" />}
                        </button>
                      )
                    })}
                  </div>

                  {/* Preview del producto seleccionado */}
                  {form.nombre && (
                    <div className="mt-3 flex items-center gap-3 p-3.5 rounded-2xl"
                      style={{ backgroundColor: 'rgba(140,144,59,0.08)', border: '1px solid rgba(140,144,59,0.25)' }}>
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
                        <img src={form.imagen_url} alt={form.nombre}
                          className="w-full h-full object-contain p-1"
                          onError={e => { e.target.src = '/newLogo3.jpeg' }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Producto seleccionado</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--tx-1)' }}>{form.nombre}</p>
                        <p className="text-[10px]" style={{ color: 'var(--tx-3)' }}>Imagen y nombre asignados automáticamente</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* En EDITAR: mostrar producto bloqueado */}
          {modal === 'edit' && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--tx-3)' }}>Producto</p>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--bd-1)' }}>
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
                  <img src={form.imagen_url} alt={form.nombre}
                    className="w-full h-full object-contain p-1"
                    onError={e => { e.target.src = '/newLogo3.jpeg' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--tx-1)' }}>{form.nombre}</p>
                  <p className="text-[10px]" style={{ color: 'var(--tx-3)' }}>El producto no se puede cambiar una vez creado</p>
                </div>
              </div>
            </div>
          )}

          {/* ── PASO 3: Datos de inventario ── */}
          {(form.nombre || modal === 'edit') && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--tx-3)' }}>
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                  {modal === 'create' ? '3' : '2'}
                </span>
                Datos del inventario
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Precio */}
                <div>
                  <label htmlFor="inv-precio" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--tx-3)' }}>
                    Precio unitario (COP) <span className="text-red-500">*</span>
                  </label>
                  <input id="inv-precio" type="number" min="0" placeholder="45000"
                    value={form.precio_unitario}
                    onChange={e => { setForm(f => ({ ...f, precio_unitario: e.target.value })); setErrors(er => ({ ...er, precio_unitario: '' })) }}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                    style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors.precio_unitario ? '#ef4444' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }} />
                  {errors.precio_unitario && <p className="mt-0.5 text-[10px] text-red-500">{errors.precio_unitario}</p>}
                </div>

                {/* Stock disponible */}
                <div>
                  <label htmlFor="inv-stock" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--tx-3)' }}>
                    Stock disponible <span className="text-red-500">*</span>
                  </label>
                  <input id="inv-stock" type="number" min="0" placeholder="10"
                    value={form.stock_disponible}
                    onChange={e => handleStockChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                    style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors.stock_disponible ? '#ef4444' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }} />
                  {errors.stock_disponible && <p className="mt-0.5 text-[10px] text-red-500">{errors.stock_disponible}</p>}
                </div>

                {/* Stock mínimo */}
                <div>
                  <label htmlFor="inv-minimo" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--tx-3)' }}>
                    Stock mínimo (alerta) <span className="text-red-500">*</span>
                  </label>
                  <input id="inv-minimo" type="number" min="0" placeholder="3"
                    value={form.stock_minimo}
                    onChange={e => { setForm(f => ({ ...f, stock_minimo: e.target.value })); setErrors(er => ({ ...er, stock_minimo: '' })) }}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                    style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors.stock_minimo ? '#ef4444' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }} />
                  {errors.stock_minimo && <p className="mt-0.5 text-[10px] text-red-500">{errors.stock_minimo}</p>}
                </div>
              </div>

              {/* Descripción y Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="inv-desc" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--tx-3)' }}>
                    Descripción <span className="text-[10px] font-normal">(opcional)</span>
                  </label>
                  <textarea id="inv-desc" rows={2}
                    placeholder="Especificaciones del producto, aplicaciones, etc."
                    value={form.descripcion}
                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none transition-colors"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
                </div>
                <div>
                  <label htmlFor="inv-estado" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--tx-3)' }}>Estado</label>
                  <select id="inv-estado" value={form.estado}
                    onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none appearance-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                </div>
              </div>

              {/* ── Razón cambio stock (solo edición cuando cambia) ── */}
              {modal === 'edit' && stockChange && (
                <div className="mt-4 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <FaExclamationTriangle className="text-yellow-500" size={14} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--tx-1)' }}>
                      Razón del cambio de stock <span className="text-red-500">*</span>
                    </p>
                  </div>
                  <select value={razon}
                    onChange={e => { setRazon(e.target.value); setErrors(er => ({ ...er, razon: '' })) }}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none appearance-none mb-2"
                    style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors.razon ? '#ef4444' : 'var(--bd-1)'}`, color: razon ? 'var(--tx-1)' : 'var(--tx-3)' }}>
                    <option value="">Selecciona la razón…</option>
                    {RAZONES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {razon === 'Otro' && (
                    <input type="text" placeholder="Especifica la razón…" value={razonOtro}
                      onChange={e => setRazonOtro(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
                  )}
                  {errors.razon && <p className="mt-1 text-xs text-red-500">{errors.razon}</p>}
                </div>
              )}
            </div>
          )}

          {/* ── Botones ── */}
          <div className="flex gap-3 pt-1">
            <button onClick={handleSave}
              disabled={loading || (modal === 'edit' && stockChange && !razon)}
              className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-50">
              {saveLabel}
            </button>
            <button onClick={() => setModal(null)} className="btn-outline flex-1 justify-center">Cancelar</button>
          </div>
        </div>
      </Modal>

      {/* ═══════ Modal Eliminar ═══════ */}
      <Modal isOpen={modal === 'delete'} onClose={() => setModal(null)} title="Desactivar producto" size="sm">
        {selected?.stock_reservado > 0 ? (
          <div className="text-center py-4">
            <FaExclamationTriangle className="mx-auto mb-3 text-yellow-500" size={32} />
            <p className="font-semibold mb-2" style={{ color: 'var(--tx-1)' }}>No se puede eliminar</p>
            <p className="text-sm" style={{ color: 'var(--tx-2)' }}>
              El producto tiene <strong>{selected?.stock_reservado}</strong> unidades reservadas en órdenes activas.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm mb-5" style={{ color: 'var(--tx-2)' }}>
              ¿Desactivar <strong>{selected?.nombre}</strong>? Dejará de aparecer en el catálogo pero conservará su historial.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={loading}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-60">
                {loading ? 'Desactivando…' : 'Desactivar'}
              </button>
              <button onClick={() => setModal(null)} className="btn-outline flex-1 justify-center">Cancelar</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
