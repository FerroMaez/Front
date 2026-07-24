import { useState, useEffect, useCallback, useRef } from 'react'
import { IoSearchOutline, IoFilterOutline } from 'react-icons/io5'
import { productService } from '../../services/api/productService'
import { CATEGORIAS, catalogImages, formatCOP } from '../../features/catalog/mockProducts'
import StockBadge from '../../components/shared/StockBadge'

export default function CatalogPage() {
  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [categoria, setCategoria] = useState('')
  const [lightbox,  setLightbox]  = useState(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data } = await productService.getAll({ search, categoria: categoria || undefined })
      setProducts(data)
    } catch { /* mantiene la lista anterior si falla la red */ }
    finally {
      if (!silent) setLoading(false)
    }
  }, [search, categoria])

  useEffect(() => { load() }, [load])

  // Mantiene una referencia siempre actualizada de load para usarla dentro del SSE sin reconectar
  const loadRef = useRef(load)
  useEffect(() => { loadRef.current = load }, [load])

  // Respaldo: refresca la lista cada 60 s por si el SSE se cae
  useEffect(() => {
    const interval = setInterval(() => load(true), 60000)
    return () => clearInterval(interval)
  }, [load])

  // SSE — tiempo real: stock por producto + alta/baja/edición de productos en el catálogo
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
    const es = new EventSource(`${apiUrl}/sse/stock`)
    es.addEventListener('stock-update', (e) => {
      try {
        const { productoId, nuevoStock } = JSON.parse(e.data)
        setProducts(prev => prev.map(p => p.id === productoId ? { ...p, stock_disponible: nuevoStock } : p))
      } catch { /* no-op */ }
    })
    es.addEventListener('catalogo-update', () => loadRef.current(true))
    return () => es.close()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header — banner con flujo de agua */}
      <div className="relative overflow-hidden rounded-[2rem] p-8 sm:p-10 mb-8"
        style={{ border: '1px solid var(--bd-1)', backgroundColor: 'var(--bg-raised)' }}>
        <div className="absolute inset-0 mesh-flow opacity-[0.16] dark:opacity-25 pointer-events-none" />
        <div className="blob w-72 h-72 -top-16 -right-10 bg-aqua-500 opacity-30 animate-flow-alt" />
        <div className="relative">
          <div className="section-badge mb-3">Catálogo de productos</div>
          <h1 className="section-title">Nuestros <span className="gradient-text">Productos</span></h1>
          <p className="section-subtitle max-w-lg">Tuberías, válvulas, acoples y accesorios con stock en tiempo real</p>
        </div>
      </div>

      {/* Filtros — barra flotante */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 p-2.5 rounded-2xl"
        style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)', boxShadow: '0 10px 30px -18px rgba(6,182,212,0.35)' }}>
        <div className="relative flex-1 max-w-sm">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--tx-3)' }} />
          <input type="text" placeholder="Buscar por nombre..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
        </div>
        <div className="relative">
          <IoFilterOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" size={15} style={{ color: 'var(--tx-3)' }} />
          <select value={categoria} onChange={e => setCategoria(e.target.value)}
            className="pl-9 pr-8 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
              <div className="h-44" style={{ backgroundColor: 'var(--bg-surface)' }} />
              <div className="p-4 space-y-2.5">
                <div className="h-3 rounded w-1/3" style={{ backgroundColor: 'var(--bg-surface)' }} />
                <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--bg-surface)' }} />
                <div className="h-6 rounded w-1/2 mt-3" style={{ backgroundColor: 'var(--bg-surface)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--tx-3)' }}>
          <IoSearchOutline size={44} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium" style={{ color: 'var(--tx-2)' }}>No hay productos disponibles en este momento.</p>
          <p className="text-sm mt-1">Contáctenos para más información.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map(p => (
            <div key={p.id} className="product-card group flex flex-col rounded-3xl overflow-hidden">
              {/* Imagen */}
              <div className="relative h-44 overflow-hidden bg-white">
                <img src={p.imagen_url} alt={p.nombre}
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                  onError={e => { e.target.src = '/newLogo3.jpeg' }} />
                <div className="absolute top-3 left-3">
                  <StockBadge disponible={p.stock_disponible} minimo={p.stock_minimo} />
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col gap-3 flex-1" style={{ borderTop: '1px solid var(--bd-1)' }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-aqua-600 dark:text-aqua-400">{p.categoria}</span>
                  <h3 className="font-bold text-sm leading-snug mt-0.5" style={{ color: 'var(--tx-1)' }}>{p.nombre}</h3>
                  {p.descripcion && <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--tx-3)' }}>{p.descripcion}</p>}
                </div>

                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-xl font-extrabold tracking-tight gradient-text">{formatCOP(p.precio_unitario)}</p>
                    <p className="text-[10px]" style={{ color: 'var(--tx-3)' }}>por unidad · {p.stock_disponible} disp.</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Imágenes catálogo */}
      {!loading && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--tx-1)' }}>Catálogo Visual</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--tx-3)' }}>Clic para ampliar</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {catalogImages.map((src, idx) => (
              <button key={src} onClick={() => setLightbox(src)}
                className="group relative aspect-square rounded-xl overflow-hidden transition-all hover:-translate-y-1"
                style={{ border: '1px solid var(--bd-1)' }}>
                <img src={src} alt={`Catálogo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(140,144,59,0.25)' }}>
                  <IoSearchOutline className="text-white" size={24} />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox && (
        <button type="button" aria-label="Cerrar imagen"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 w-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.88)', cursor: 'zoom-out' }}
          onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Catálogo ampliado" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
        </button>
      )}

    </div>
  )
}
