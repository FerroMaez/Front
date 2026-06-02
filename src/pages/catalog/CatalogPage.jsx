import { useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import { catalogProducts, catalogImages } from '../../features/catalog/catalogData'
import ProductCard from '../../components/shared/ProductCard'

export default function CatalogPage() {
  const [search,   setSearch]   = useState('')
  const [lightbox, setLightbox] = useState(null)

  const filtered = catalogProducts.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="mb-10">
        <div className="section-badge mb-4">Lo que tenemos</div>
        <h1 className="section-title">Catálogo de Productos</h1>
        <p className="section-subtitle">
          Portafolio completo en válvulas, tuberías y accesorios para sistemas hidráulicos
        </p>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-md mb-12">
        <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2" size={17}
          style={{ color: 'var(--tx-3)' }} />
        <input
          type="text"
          placeholder="Buscar en el catálogo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-colors outline-none"
          style={{
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--bd-1)',
            color: 'var(--tx-1)',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(140,144,59,0.5)' }}
          onBlur={(e)  => { e.target.style.borderColor = 'var(--bd-1)' }}
        />
      </div>

      {/* Grid de servicios */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--tx-1)' }}>
          Líneas de producto
        </h2>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16" style={{ color: 'var(--tx-3)' }}>
            <IoSearchOutline size={40} className="mx-auto mb-3 opacity-40" />
            <p>No se encontraron resultados para &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </section>

      {/* Catálogo visual */}
      <section>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--tx-1)' }}>
          Catálogo Visual
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--tx-3)' }}>
          Haz clic en las imágenes para ampliar
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {catalogImages.map((src, idx) => (
            <button
              key={src}
              onClick={() => setLightbox(src)}
              className="group relative aspect-square rounded-xl overflow-hidden transition-all hover:-translate-y-1"
              style={{ border: '1px solid var(--bd-1)' }}
            >
              <img
                src={src}
                alt={`Catálogo ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(140,144,59,0.25)' }}>
                <IoSearchOutline className="text-white" size={26} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <button
          type="button"
          aria-label="Cerrar imagen"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 w-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.88)', cursor: 'zoom-out' }}
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === 'Escape' && setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Catálogo ampliado"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
          />
        </button>
      )}
    </div>
  )
}
