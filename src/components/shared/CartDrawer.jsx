import { Link } from 'react-router-dom'
import { FaTimes, FaTrash, FaShoppingCart } from 'react-icons/fa'
import { IoAddOutline, IoRemoveOutline } from 'react-icons/io5'
import { useCartStore } from '../../store/cartStore'
import { formatCOP } from '../../utils/formatters'
import StockBadge from './StockBadge'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, getTotal, getCount } = useCartStore()
  const total = getTotal()
  const count = getCount()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <button type="button" aria-label="Cerrar carrito"
        className="fixed inset-0 z-40 w-full h-full"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col shadow-2xl"
        style={{ backgroundColor: 'var(--bg-raised)', borderLeft: '1px solid var(--bd-1)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--bd-1)' }}>
          <div className="flex items-center gap-2">
            <FaShoppingCart className="text-brand-500" size={18} />
            <h2 className="font-bold text-base" style={{ color: 'var(--tx-1)' }}>Mi Cotización</h2>
            {count > 0 && <span className="px-2 py-0.5 bg-brand-600 text-white text-xs font-bold rounded-full">{count}</span>}
          </div>
          <button onClick={closeCart} className="p-2 rounded-xl hover:bg-brand-500/10 transition-colors" style={{ color: 'var(--tx-2)' }}>
            <FaTimes size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
              <FaShoppingCart size={40} style={{ color: 'var(--tx-3)', opacity: 0.3 }} />
              <div>
                <p className="font-semibold" style={{ color: 'var(--tx-2)' }}>Tu cotización está vacía</p>
                <p className="text-sm mt-1" style={{ color: 'var(--tx-3)' }}>Explora nuestro catálogo</p>
              </div>
              <Link to="/catalogo" onClick={closeCart} className="btn-primary text-sm">Ver catálogo</Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 p-3 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--bd-1)' }}>
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-raised)' }}>
                  <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-contain p-1"
                    onError={e => { e.target.src = '/newLogo3.jpeg' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-snug truncate" style={{ color: 'var(--tx-1)' }}>{item.nombre}</p>
                  <p className="text-xs text-brand-600 dark:text-brand-300 font-bold mt-0.5">{formatCOP(item.precio_unitario)}</p>
                  {item.stock_disponible <= item.stock_minimo && item.stock_disponible > 0 && (
                    <div className="mt-1"><StockBadge disponible={item.stock_disponible} minimo={item.stock_minimo} /></div>
                  )}
                  {item.stock_disponible === 0 && (
                    <p className="text-xs text-red-500 mt-1 font-medium">Sin stock disponible</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 rounded-lg overflow-hidden" style={{ border: '1px solid var(--bd-1)' }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)}
                        className="p-1.5 hover:bg-brand-500/10 transition-colors" style={{ color: 'var(--tx-2)' }}>
                        <IoRemoveOutline size={13} />
                      </button>
                      <span className="px-2 text-sm font-semibold min-w-[1.5rem] text-center" style={{ color: 'var(--tx-1)' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}
                        disabled={item.qty >= item.stock_disponible}
                        className="p-1.5 hover:bg-brand-500/10 transition-colors disabled:opacity-40" style={{ color: 'var(--tx-2)' }}>
                        <IoAddOutline size={13} />
                      </button>
                    </div>
                    <span className="text-xs font-semibold ml-auto" style={{ color: 'var(--tx-2)' }}>
                      {formatCOP(item.precio_unitario * item.qty)}
                    </span>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                      <FaTrash size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 space-y-3" style={{ borderTop: '1px solid var(--bd-1)' }}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: 'var(--tx-2)' }}>Total estimado</span>
              <span className="text-xl font-bold text-brand-600 dark:text-brand-300">{formatCOP(total)}</span>
            </div>
            <Link to="/carrito" onClick={closeCart}
              className="btn-primary w-full justify-center text-sm py-3">
              Ver cotización completa
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
