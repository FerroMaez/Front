import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaWhatsapp } from 'react-icons/fa'
import { IoCloseOutline } from 'react-icons/io5'
import { catalogProducts, companyInfo } from '../../features/catalog/catalogData'

export default function ServicePage() {
  const { slug } = useParams()
  const [selected, setSelected] = useState(null)

  const product = catalogProducts.find((p) => p.slug === slug)

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--tx-1)' }}>
          Servicio no encontrado
        </h2>
        <Link to="/catalogo" className="btn-primary">Volver al catálogo</Link>
      </div>
    )
  }

  const selectedSuffix = selected ? ` - ${selected.nombre}` : ''
  const waMessage = encodeURIComponent(
    `Hola MANHID, me interesa información sobre ${product.nombre}${selectedSuffix}.`
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Volver */}
      <Link to="/catalogo"
        className="inline-flex items-center gap-2 text-sm mb-8 transition-colors text-aqua-600 dark:text-aqua-400 hover:text-aqua-500">
        <FaArrowLeft size={12} />
        Volver al catálogo
      </Link>

      {/* Hero producto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">

        {/* Imagen principal */}
        <div className="relative rounded-3xl overflow-hidden aspect-[4/3] flex items-center justify-center shadow-raised"
          style={{ backgroundColor: 'white', border: '1px solid var(--bd-1)' }}>
          <img
            src={selected ? selected.imagen : product.imagen}
            alt={selected ? selected.nombre : product.nombre}
            className="w-full h-full object-contain p-8 transition-all duration-300"
            onError={(e) => { e.target.src = '/newLogo3.jpeg' }}
          />
          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-brand-500/10"
              style={{ color: 'var(--tx-2)' }}
            >
              <IoCloseOutline size={20} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <div className="section-badge mb-4">
            {selected ? 'Producto seleccionado' : 'Línea de producto'}
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-4 leading-tight" style={{ color: 'var(--tx-1)' }}>
            {selected ? selected.nombre : <span className="gradient-text">{product.nombre}</span>}
          </h1>

          {!selected && (
            <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--tx-2)' }}>
              {product.descripcion}
            </p>
          )}
          {selected && (
            <p className="text-base mb-6" style={{ color: 'var(--tx-2)' }}>
              Parte de la línea{' '}
              <span className="text-aqua-600 dark:text-aqua-300 font-semibold">{product.nombre}</span>.
              Contáctanos para disponibilidad y precios.
            </p>
          )}

          <a
            href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g, '')}?text=${waMessage}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-full transition-all hover:-translate-y-0.5 shadow-md shadow-green-900/20 w-fit text-sm"
          >
            <FaWhatsapp size={17} />
            Consultar precio / disponibilidad
          </a>

          {!selected && (
            <p className="text-xs mt-4" style={{ color: 'var(--tx-3)' }}>
              Haz clic en un producto de abajo para ver el detalle
            </p>
          )}
        </div>
      </div>

      {/* Grid de subcategorías */}
      <div>
        <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--tx-1)' }}>
          <span>Productos disponibles</span>
          <span className="ml-2 text-sm font-normal" style={{ color: 'var(--tx-3)' }}>
            ({product.subcategorias.length} items)
          </span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {product.subcategorias.map((sub) => {
            const isActive = selected?.id === sub.id
            return (
              <button
                key={sub.id}
                onClick={() => setSelected(isActive ? null : sub)}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl text-center transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  border: `1px solid ${isActive ? 'rgba(6,182,212,0.6)' : 'var(--bd-1)'}`,
                  backgroundColor: isActive ? 'rgba(6,182,212,0.10)' : 'var(--bg-raised)',
                  boxShadow: isActive ? '0 8px 26px -6px rgba(6,182,212,0.35)' : 'none',
                }}
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-white">
                  <img
                    src={sub.imagen}
                    alt={sub.nombre}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                    onError={(e) => { e.target.src = '/newLogo3.jpeg' }}
                  />
                </div>
                <p className="text-xs font-medium leading-snug transition-colors"
                  style={{ color: isActive ? 'var(--tx-1)' : 'var(--tx-2)' }}>
                  {sub.nombre}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
