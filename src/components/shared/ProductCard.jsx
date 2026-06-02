import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'

/**
 * @param {{ product: { slug: string, imagen: string, nombre: string, descripcion?: string } }} props
 */
export default function ProductCard({ product }) {
  return (
    <Link
      to={`/servicios/${product.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: 'var(--bg-raised)',
        border: '1px solid var(--bd-1)',
        boxShadow: '0 2px 12px -4px rgba(140,144,59,0.08)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(140,144,59,0.45)'
        e.currentTarget.style.boxShadow = '0 8px 32px -8px rgba(140,144,59,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--bd-1)'
        e.currentTarget.style.boxShadow = '0 2px 12px -4px rgba(140,144,59,0.08)'
      }}
    >
      {/* Imagen */}
      <div className="relative h-44 overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <img
          src={product.imagen}
          alt={product.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = '/newLogo3.jpeg' }}
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, var(--bg-raised) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/8 transition-colors duration-300" />
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-semibold text-sm leading-snug transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300"
          style={{ color: 'var(--tx-1)' }}>
          {product.nombre}
        </h3>
        <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--tx-3)' }}>
          {product.descripcion}
        </p>
        <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-brand-600 dark:text-brand-400"
          style={{ borderTop: '1px solid var(--bd-1)' }}>
          Ver productos
          <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </Link>
  )
}
