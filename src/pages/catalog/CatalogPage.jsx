import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { IoSearchOutline, IoFilterOutline } from 'react-icons/io5'
import { FaShoppingCart, FaCheck } from 'react-icons/fa'
import { productService } from '../../services/api/productService'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { CATEGORIAS, catalogImages, formatCOP } from '../../features/catalog/mockProducts'
import StockBadge from '../../components/shared/StockBadge'
import Modal from '../../components/ui/Modal'

export default function CatalogPage() {
  const { isAuthenticated } = useAuthStore()
  const { addItem, items }  = useCartStore()

  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [categoria, setCategoria] = useState('')
  const [lightbox,  setLightbox]  = useState(null)
  const [loginModal,setLoginModal]= useState(false)
  const [added,     setAdded]     = useState({})   // { [id]: true } feedback visual

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await productService.getAll({ search, categoria: categoria || undefined })
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }, [search, categoria])

  useEffect(() => { load() }, [load])

  // SSE — actualización de stock en tiempo real
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
    const es = new EventSource(`${apiUrl}/sse/stock`)
    es.onmessage = (e) => {
      try {
        const { productoId, nuevoStock } = JSON.parse(e.data)
        setProducts(prev => prev.map(p => p.id === productoId ? { ...p, stock_disponible: nuevoStock } : p))
      } catch { /* no-op */ }
    }
    return () => es.close()
  }, [])

  const handleAddToCart = (product) => {
    if (!isAuthenticated) { setLoginModal(true); return }
    addItem(product)
    setAdded(a => ({ ...a, [product.id]: true }))
    setTimeout(() => setAdded(a => ({ ...a, [product.id]: false })), 1500)
  }

  const inCart = (id) => items.some(i => i.id === id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="section-badge mb-3">Catálogo de productos</div>
        <h1 className="section-title">Nuestros Productos</h1>
        <p className="section-subtitle">Tuberías, válvulas, acoples y accesorios con stock en tiempo real</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
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
              <div className="h-44 bg-white/10" />
              <div className="p-4 space-y-2">
                <div className="h-4 rounded bg-white/10 w-3/4" />
                <div className="h-3 rounded bg-white/10 w-1/2" />
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
            <div key={p.id} className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)', boxShadow: '0 2px 12px -4px rgba(140,144,59,0.06)' }}>
              {/* Imagen */}
              <div className="relative h-44 overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <img src={p.imagen_url} alt={p.nombre}
                  className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                  onError={e => { e.target.src = '/newLogo3.jpeg' }} />
                <div className="absolute top-3 left-3">
                  <StockBadge disponible={p.stock_disponible} minimo={p.stock_minimo} />
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--tx-3)' }}>{p.categoria}</span>
                  <h3 className="font-semibold text-sm leading-snug mt-0.5" style={{ color: 'var(--tx-1)' }}>{p.nombre}</h3>
                  {p.descripcion && <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--tx-3)' }}>{p.descripcion}</p>}
                </div>

                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-xl font-bold text-brand-600 dark:text-brand-300">{formatCOP(p.precio_unitario)}</p>
                    <p className="text-[10px]" style={{ color: 'var(--tx-3)' }}>por unidad · {p.stock_disponible} disp.</p>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(p)}
                  disabled={p.stock_disponible === 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: p.stock_disponible === 0 ? 'var(--bg-surface)' : added[p.id] ? 'rgba(34,197,94,0.15)' : 'rgba(140,144,59,0.15)',
                    border: `1px solid ${p.stock_disponible === 0 ? 'var(--bd-1)' : added[p.id] ? 'rgba(34,197,94,0.4)' : 'rgba(140,144,59,0.4)'}`,
                    color: p.stock_disponible === 0 ? 'var(--tx-3)' : added[p.id] ? '#16a34a' : 'var(--tx-1)',
                  }}>
                  {p.stock_disponible === 0
                    ? 'Sin stock'
                    : added[p.id]
                      ? <><FaCheck size={12}/> Agregado</>
                      : <><FaShoppingCart size={13}/> {inCart(p.id) ? 'Agregar más' : 'Agregar al carrito'}</>}
                </button>
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

      {/* Modal login */}
      <Modal isOpen={loginModal} onClose={() => setLoginModal(false)} title="Inicia sesión para continuar" size="sm">
        <p className="text-sm mb-5" style={{ color: 'var(--tx-2)' }}>Para agregar productos a tu cotización debes iniciar sesión.</p>
        <div className="flex gap-3">
          <Link to="/login" onClick={() => setLoginModal(false)} className="btn-primary flex-1 justify-center">Iniciar Sesión</Link>
          <button onClick={() => setLoginModal(false)} className="btn-outline flex-1 justify-center">Cancelar</button>
        </div>
      </Modal>
    </div>
  )
}
