import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'

/**
 * @param {{ product: { slug: string, imagen: string, nombre: string, descripcion?: string } }} props
 */
export default function ProductCard({ product }) {
  return (
    <Link
      to={`/servicios/${product.slug}`}
      className="product-card group relative flex flex-col rounded-3xl overflow-hidden h-full"
    >
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <img
          src={product.imagen}
          alt={product.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = '/newLogo3.jpeg' }}
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, var(--bg-raised) 2%, transparent 55%)' }} />
        {/* Lavado de agua al hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(120deg, rgba(140,144,59,0.12), rgba(6,182,212,0.18))' }} />
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-sm leading-snug transition-colors group-hover:text-aqua-600 dark:group-hover:text-aqua-300"
          style={{ color: 'var(--tx-1)' }}>
          {product.nombre}
        </h3>
        <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--tx-3)' }}>
          {product.descripcion}
        </p>
        <div className="flex items-center gap-1.5 pt-3 text-xs font-bold text-brand-600 dark:text-aqua-300"
          style={{ borderTop: '1px solid var(--bd-1)' }}>
          Ver productos
          <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </Link>
  )
}
