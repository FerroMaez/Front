import { useState, useEffect, useCallback } from 'react'
import { FaPlus, FaEdit, FaSearch, FaChevronRight, FaCheckCircle } from 'react-icons/fa'
import { productService } from '../../../services/api/productService'
import { LINEAS_SERVICIO, getStockStatus } from '../../../features/catalog/mockProducts'
import { catalogProducts } from '../../../features/catalog/catalogData'
import { getMedidasProducto } from '../../../features/catalog/productMeasures'
import { formatCOP } from '../../../utils/formatters'
import Modal from '../../../components/ui/Modal'
import imagenHidraulica from '../../../assets/lineas/hidraulica.jpeg'
import imagenIncendio from '../../../assets/lineas/incendio.jpeg'
import imagenAcueducto from '../../../assets/lineas/acueducto.jpeg'
import imagenAcero from '../../../assets/lineas/acero.jpeg'
import imagenPvc from '../../../assets/lineas/pvc.jpg'

const IMAGEN_LINEA = {
  HIDRAULICA: imagenHidraulica,
  INCENDIO: imagenIncendio,
  ACUEDUCTO: imagenAcueducto,
  ACERO: imagenAcero,
  PVC: imagenPvc,
}

const emptyForm = {
  linea_servicio: '', nombre: '', imagen_url: '', categoria: '',
  descripcion: '', precio_unitario: '', stock_disponible: '', stock_minimo: '',
  estado: 'ACTIVO', pulgadas: '', condicion: 'NUEVO', tipo_inventario: 'INVENTARIO', cantidad: '',
}

// ── Funciones puras (fuera del componente para reducir complejidad cognitiva) ──
function subcatsForLinea(lineaValue) {
  const linea = LINEAS_SERVICIO.find(l => l.value === lineaValue)
  if (!linea) return []
  return catalogProducts.find(cp => cp.slug === linea.slug)?.subcategorias ?? []
}

function buildErrors(form, isArreglos) {
  const e = {}
  if (!form.linea_servicio) e.linea_servicio = 'Selecciona la línea de servicio'
  if (!form.nombre) e.nombre = 'Selecciona el producto del catálogo'
  if (isArreglos) {
    if (!Number.isSafeInteger(Number(form.cantidad)) || Number(form.cantidad) <= 0) e.cantidad = 'Ingresa una cantidad entera mayor que cero'
  } else {
    if (!form.precio_unitario || Number(form.precio_unitario) <= 0) e.precio_unitario = 'Precio inválido'
    if (form.stock_disponible === '' || !Number.isSafeInteger(Number(form.stock_disponible)) || Number(form.stock_disponible) < 0) e.stock_disponible = 'Ingresa un stock entero válido'
    if (form.stock_minimo === '' || Number(form.stock_minimo) < 0) e.stock_minimo = 'Stock mínimo inválido'
  }
  return e
}
export default function InventoryPage({ tipoInventario = 'INVENTARIO', titulo = 'Inventario' }) {
  const isArreglos = tipoInventario === 'ARREGLO'
  const [products,    setProducts]    = useState([])
  const [search,      setSearch]      = useState('')
  const [lineaFiltro, setLineaFiltro] = useState('')
  const [modal,       setModal]       = useState(null)   // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null)
  const [editOptions, setEditOptions] = useState([])
  const [form,        setForm]        = useState(emptyForm)
  const [errors,      setErrors]      = useState({})
  const [loading,     setLoading]     = useState(false)
  const [toast,       setToast]       = useState('')
  const [errorStock, setErrorStock] = useState('')
  const [cantidadAgregar, setCantidadAgregar] = useState('')

  const load = useCallback(async () => {
    try {
      const { data } = await productService.getAll({ search, tipoInventario })
      const filtered = data.filter(p => (!lineaFiltro || p.linea_servicio === lineaFiltro)
        && (!isArreglos || Number(p.stock_disponible) > 0))
      setProducts(filtered)
    } catch {
      // mantiene la lista anterior si falla la red
    }
  }, [search, lineaFiltro, tipoInventario, isArreglos])

  useEffect(() => { load() }, [load])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const openCreate = () => {
    setForm({ ...emptyForm, tipo_inventario: tipoInventario }); setErrors({}); setErrorStock(''); setCantidadAgregar('')
    setModal('create')
  }

  const openEdit = async () => {
    setSelected(null)
    setForm({ ...emptyForm, tipo_inventario: tipoInventario })
    setErrors({})
    setErrorStock('')
    setCantidadAgregar('')
    setModal('edit')
    try {
      const { data } = await productService.getAll({ tipoInventario })
      setEditOptions(data)
    } catch {
      showToast('No se pudieron cargar los productos para editar.')
    }
  }

  const selectEditProduct = (p) => {
    if (!p) {
      setSelected(null)
      setForm(f => ({ ...emptyForm, tipo_inventario: tipoInventario, linea_servicio: f.linea_servicio }))
      return
    }
    setSelected(p)
    setForm({
      linea_servicio: p.linea_servicio || '', nombre: p.nombre || '', imagen_url: p.imagen_url || '',
      categoria: p.categoria || 'OTRO', descripcion: p.descripcion || '', pulgadas: p.pulgadas || '',
      condicion: p.condicion || 'NUEVO', tipo_inventario: p.tipo_inventario || tipoInventario,
      precio_unitario: String(p.precio_unitario), stock_disponible: String(p.stock_disponible),
      stock_minimo: String(p.stock_minimo), estado: p.estado || 'ACTIVO',
    })
    setErrors({})
    setErrorStock('')
  }

  // Al seleccionar un producto del catálogo → auto-asigna nombre + imagen + categoria
  const handleSelectSubcat = (subcat) => {
    setForm(f => ({ ...f, nombre: subcat.nombre, imagen_url: subcat.imagen, categoria: subcat.categoria, pulgadas: '' }))
    setErrors(e => ({ ...e, nombre: '' }))
  }

  const handleStockChange = (val) => {
    setForm(f => ({ ...f, stock_disponible: val }))
  }

  const validate = () => {
    const e = buildErrors(form, isArreglos)
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const linea = LINEAS_SERVICIO.find(l => l.value === form.linea_servicio)
      if (isArreglos) {
        const cantidad = Number(form.cantidad)
        const payloadArreglo = {
          ...form,
          tipo_inventario: 'ARREGLO',
          condicion: 'REMANUFACTURADO',
          precio_unitario: 0,
          stock_disponible: cantidad,
          stock_minimo: 0,
          estado: 'ACTIVO',
          linea_label: linea?.label || '',
        }
        const { data } = await productService.getAll({ tipoInventario: 'ARREGLO' })
        const existente = data.find(p => p.estado === 'ACTIVO'
          && p.nombre === payloadArreglo.nombre
          && p.linea_servicio === payloadArreglo.linea_servicio
          && (p.pulgadas || '') === (payloadArreglo.pulgadas || '')
          && p.condicion === 'REMANUFACTURADO')
        if (existente) {
          await productService.addStock(existente.id, cantidad)
          showToast('Arreglo actualizado: se sumaron ' + cantidad + ' unidades.')
        } else {
          await productService.create(payloadArreglo)
          showToast('Producto agregado al historial de arreglos.')
        }
        setModal(null)
        await load()
        return
      }
      const payload = {
        ...form,
        tipo_inventario: tipoInventario,
        precio_unitario:  Number(form.precio_unitario),
        stock_disponible: Number(form.stock_disponible),
        stock_minimo:     Number(form.stock_minimo),
        linea_label:      linea?.label || '',
      }
      if (modal === 'create') {
        await productService.create(payload)
        showToast('Producto creado exitosamente.')
      } else {
        const incremento = cantidadAgregar === '' ? 0 : Number(cantidadAgregar)
        if (!Number.isSafeInteger(incremento) || incremento < 0) {
          setErrorStock('Ingresa una cantidad entera igual o mayor que cero.')
          return
        }
        await productService.update(selected.id, payload)
        if (incremento > 0) await productService.addStock(selected.id, incremento)
        showToast(incremento > 0 ? `Producto actualizado y se agregaron ${incremento} unidades.` : 'Producto actualizado correctamente.')
      }
      setModal(null); load()
    } catch {
      showToast('No se pudieron guardar los cambios. Revisa la conexión e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const transferirAlInventario = async (arreglo) => {
    if (!arreglo.stock_disponible || arreglo.stock_disponible <= 0) return
    setLoading(true)
    try {
      const { data: inventario } = await productService.getAll({ tipoInventario: 'INVENTARIO' })
      const destino = inventario.find(p => p.estado === 'ACTIVO'
        && p.nombre === arreglo.nombre
        && p.linea_servicio === arreglo.linea_servicio
        && (p.pulgadas || '') === (arreglo.pulgadas || '')
        && p.condicion === arreglo.condicion)
      if (!destino) {
        showToast('Crea primero en Inventario el producto con la misma línea, medida y condición.')
        return
      }
      const cantidad = arreglo.stock_disponible
      await productService.transferArrangement(arreglo.id, destino.id)
      showToast('Se sumaron ' + cantidad + ' unidades a ' + destino.nombre + '.')
      setProducts(current => current.filter(p => p.id !== arreglo.id))
      await load()
    } catch (err) {
      showToast(err.response?.data?.message || 'No se pudo sumar el arreglo al inventario.')
    } finally {
      setLoading(false)
    }
  }

  const currentSubcats = subcatsForLinea(form.linea_servicio)
  const medidasProducto = getMedidasProducto(form.nombre, form.linea_servicio)
  const opcionesMedida = form.pulgadas && !medidasProducto.includes(form.pulgadas)
    ? [form.pulgadas, ...medidasProducto]
    : medidasProducto

  // Etiqueta de guardado (sin ternarios anidados)
  let saveLabel = 'Guardar cambios'
  if (loading)              saveLabel = 'Guardando…'
  else if (modal === 'create') saveLabel = isArreglos ? 'Agregar arreglo' : 'Crear producto'

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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>{titulo}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--tx-3)' }}>{products.length} {isArreglos ? 'productos en el historial' : 'productos registrados'}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isArreglos && <button onClick={openEdit} disabled={loading} className="btn-outline text-sm gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <FaEdit size={12} /> Editar producto
          </button>}
          <button onClick={openCreate} className="btn-primary text-sm gap-2">
            <FaPlus size={12} /> Agregar producto
          </button>
        </div>
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
          <table className="text-sm data-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--bd-1)' }}>
                {(isArreglos ? ['Producto', 'Línea de servicio', 'Medida', 'Condición', 'Cantidad', 'Acción'] : ['Producto', 'Linea de servicio', 'Medida', 'Condicion', 'Precio', 'Cantidad']).map(h => (
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
              {products.map((p) => {
                const linea = LINEAS_SERVICIO.find(l => l.value === (p.linea_servicio || p.categoria))
                return (
                  <tr key={p.id}>
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
                    <td className="px-4 py-3">{p.pulgadas || '—'}</td>
                    <td className="px-4 py-3">{isArreglos ? 'Manufacturado' : (p.condicion === 'REMANUFACTURADO' ? 'Remanufacturado' : 'Nuevo')}</td>
                    {isArreglos ? (
                      <>
                        <td className="px-4 py-3 font-semibold">{p.stock_disponible}</td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => transferirAlInventario(p)} disabled={loading || p.stock_disponible <= 0}
                            className="btn-primary text-xs px-3 py-2 disabled:opacity-50">
                            Sumar al inventario
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-bold text-sm text-brand-600 dark:text-brand-300">{formatCOP(p.precio_unitario)}</td>
                        <td className="px-4 py-3">
                          {(() => {
                            const color = getStockStatus(Number(p.stock_disponible) || 0, Number(p.stock_minimo) || 0).color
                            const colors = {
                              green: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/25',
                              yellow: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/25',
                              red: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',
                            }
                            return <span className={`inline-flex min-w-14 justify-center px-3 py-1 rounded-full text-lg font-extrabold border ${colors[color]}`} aria-label={`Cantidad: ${p.stock_disponible}`}>{p.stock_disponible}</span>
                          })()}
                        </td>
                      </>
                    )}
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
        title={isArreglos ? 'Agregar producto a Arreglos' : (modal === 'create' ? 'Agregar Producto al Inventario' : selected ? 'Editar: ' + selected.nombre : 'Editar producto')}
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
                    onClick={() => {
                      if (modal === 'edit') {
                        setSelected(null)
                        setForm({ ...emptyForm, tipo_inventario: tipoInventario, linea_servicio: l.value })
                        setErrorStock('')
                      } else {
                        setForm(f => ({ ...f, linea_servicio: l.value, nombre: '', imagen_url: '', pulgadas: '' }))
                      }
                      setErrors(e => ({ ...e, linea_servicio: '', nombre: '' }))
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left"
                    style={{
                      backgroundColor: isActive ? l.color : 'var(--bg-surface)',
                      borderColor:     isActive ? l.colorBorder : 'var(--bd-1)',
                      color:           isActive ? 'var(--tx-1)' : 'var(--tx-2)',
                      opacity: 1,
                      boxShadow:       isActive ? `0 2px 12px -2px ${l.colorBorder}` : 'none',
                    }}>
                    <img src={IMAGEN_LINEA[l.value]} alt={l.label}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = imagenHidraulica }} />
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

          {modal === 'edit' && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--tx-3)' }}>Producto</p>
              {!form.linea_servicio ? (
                <p className="text-sm" style={{ color: 'var(--tx-3)' }}>Selecciona primero una linea de servicio.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                    {editOptions.filter(p => p.linea_servicio === form.linea_servicio).map(p => {
                      const isSelected = selected?.id === p.id
                      return (
                        <button key={p.id} type="button" onClick={() => selectEditProduct(p)}
                          className="flex items-center gap-2 p-2.5 rounded-xl text-left text-xs font-medium transition-all border"
                          style={{
                            backgroundColor: isSelected ? 'rgba(140,144,59,0.12)' : 'var(--bg-surface)',
                            borderColor: isSelected ? 'rgba(140,144,59,0.5)' : 'var(--bd-1)',
                            color: isSelected ? 'var(--tx-1)' : 'var(--tx-2)',
                            boxShadow: isSelected ? '0 2px 8px -2px rgba(140,144,59,0.2)' : 'none',
                          }}>
                          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
                            style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
                            <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain p-0.5"
                              onError={e => { e.target.src = '/newLogo3.jpeg' }} />
                          </div>
                          <span className="leading-snug">
                            {p.nombre}
                            {(p.pulgadas || p.condicion === 'REMANUFACTURADO') && (
                              <span className="block mt-0.5 text-[10px]" style={{ color: 'var(--tx-3)' }}>
                                {[p.pulgadas, p.condicion === 'REMANUFACTURADO' ? 'Remanufacturado' : 'Nuevo'].filter(Boolean).join(' · ')}
                              </span>
                            )}
                          </span>
                          {isSelected && <FaCheckCircle size={11} className="ml-auto flex-shrink-0 text-brand-500" />}
                        </button>
                      )
                    })}
                  </div>
                  {editOptions.filter(p => p.linea_servicio === form.linea_servicio).length === 0 && (
                    <p className="mt-2 text-xs" style={{ color: 'var(--tx-3)' }}>No hay productos registrados en esta linea.</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Datos del inventario */}
          {(form.nombre || (modal === 'edit' && selected)) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--tx-3)' }}>
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                  {modal === 'create' ? '3' : '2'}
                </span>
                {isArreglos ? 'Datos del arreglo' : 'Datos del inventario'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="inv-medida" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--tx-3)' }}>Medida (pulgadas)</label>
                  <select id="inv-medida" value={form.pulgadas} onChange={e => setForm(f => ({ ...f, pulgadas: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>
                    <option value="">{opcionesMedida.length ? 'Sin medida' : 'Este producto no tiene medidas configuradas'}</option>
                    {opcionesMedida.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {isArreglos ? (
                  <div className="flex flex-col justify-center">
                    <span className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--tx-3)' }}>Condición</span>
                    <span className="text-sm" style={{ color: 'var(--tx-1)' }}>Manufacturado</span>
                  </div>
                ) : (
                <div>
                  <label htmlFor="inv-condicion" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--tx-3)' }}>Condición</label>
                  <select id="inv-condicion" value={form.condicion} onChange={e => setForm(f => ({ ...f, condicion: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>
                    <option value="NUEVO">Nuevo</option>
                    <option value="REMANUFACTURADO">Remanufacturado</option>
                  </select>
                </div>
                )}
                {isArreglos && (
                  <div>
                    <label htmlFor="inv-cantidad-arreglo" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--tx-3)' }}>Cantidad <span className="text-red-500">*</span></label>
                    <input id="inv-cantidad-arreglo" type="number" min="1" step="1" inputMode="numeric" value={form.cantidad}
                      onChange={e => { setForm(f => ({ ...f, cantidad: e.target.value })); setErrors(er => ({ ...er, cantidad: '' })) }}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: 'var(--bg-input)', border: errors.cantidad ? '1px solid #ef4444' : '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
                    {errors.cantidad && <p className="mt-0.5 text-[10px] text-red-500">{errors.cantidad}</p>}
                  </div>
                )}
                {/* Precio */}
{!isArreglos && (
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
                )}

                {/* Stock disponible */}
{!isArreglos && (
                <div>
                  <label htmlFor="inv-stock" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--tx-3)' }}>
                    {modal === 'edit' ? 'Stock disponible actual' : 'Stock disponible'} <span className="text-red-500">*</span>
                  </label>
                  <input id="inv-stock" type="number" min="0" step="1" inputMode="numeric" placeholder="10" readOnly={modal === 'edit'}
                    value={form.stock_disponible}
                    onChange={e => { handleStockChange(e.target.value); setErrorStock('') }}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
                    style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors.stock_disponible || errorStock ? '#ef4444' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }} />
                  {modal === 'edit' && (
                    <div className="mt-2">
                      <label htmlFor="inv-stock-add" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--tx-3)' }}>Cantidad que se va a sumar</label>
                      <input id="inv-stock-add" type="number" min="0" step="1" inputMode="numeric" value={cantidadAgregar}
                        onChange={e => { setCantidadAgregar(e.target.value); setErrorStock('') }}
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
                      <p className="mt-1 text-[10px]" style={{ color: 'var(--tx-3)' }}>Stock actual: {selected?.stock_disponible}. Total nuevo: {Number(selected?.stock_disponible || 0) + (Number(cantidadAgregar) || 0)}.</p>
                    </div>
                  )}
                  {errors.stock_disponible && <p className="mt-0.5 text-[10px] text-red-500">{errors.stock_disponible}</p>}
                  {errorStock && <p className="mt-0.5 text-[10px] text-red-500">{errorStock}</p>}
                </div>
                )}

                {/* Stock mínimo */}
{!isArreglos && (
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
                )}
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
{!isArreglos && (
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
                )}
              </div>
            </div>
          )}

          {/* ── Botones ── */}
          <div className="flex gap-3 pt-1">
            <button onClick={handleSave}
              disabled={loading || (modal === 'edit' && !selected)}
              className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-50">
              {saveLabel}
            </button>
            <button onClick={() => setModal(null)} className="btn-outline flex-1 justify-center">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
