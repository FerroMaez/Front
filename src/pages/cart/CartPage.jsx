import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaTrash, FaWhatsapp, FaCheckCircle, FaExclamationTriangle, FaFileInvoice } from 'react-icons/fa'
import { IoAddOutline, IoRemoveOutline } from 'react-icons/io5'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { orderService } from '../../services/api/orderService'
import { formatCOP } from '../../utils/formatters'
import StockBadge from '../../components/shared/StockBadge'
import Modal from '../../components/ui/Modal'
import { companyInfo } from '../../features/catalog/catalogData'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, removeItem, updateQty, clearCart, getTotal } = useCartStore()
  const { user } = useAuthStore()
  const total = getTotal()

  const [confirmModal, setConfirmModal] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [errorMsg,     setErrorMsg]     = useState('')
  const [loading,      setLoading]      = useState(false)
  const [orderId,      setOrderId]      = useState('')

  const handleConfirm = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const orderItems = items.map(i => ({ producto_id: i.id, cantidad: i.qty }))
      const order = await orderService.confirm({ items: orderItems, user })
      setOrderId(order.id)
      clearCart()
      setConfirmModal(false)
      setSuccessModal(true)
    } catch (err) {
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message
      setErrorMsg(serverMsg || 'Error al procesar la reserva. Intenta de nuevo.')
      setConfirmModal(false)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && !successModal) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <FaCheckCircle size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--tx-3)' }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--tx-1)' }}>Tu cotización está vacía</h2>
        <p className="mb-6" style={{ color: 'var(--tx-3)' }}>Explora nuestro catálogo y agrega productos.</p>
        <Link to="/catalogo" className="btn-primary">Ver catálogo</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="section-title">Mi Cotización</h1>
        <p className="section-subtitle">{items.length} producto{items.length !== 1 ? 's' : ''} — reserva sin costo, cierre telefónico</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl flex items-start gap-3 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <FaExclamationTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
          <div>
            <p className="font-semibold text-red-600 dark:text-red-400">No se pudo procesar</p>
            <p className="mt-0.5" style={{ color: 'var(--tx-2)' }}>{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-contain p-2"
                  onError={e => { e.target.src = '/newLogo3.jpeg' }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--tx-3)' }}>{item.categoria}</p>
                    <h3 className="font-semibold text-sm mt-0.5" style={{ color: 'var(--tx-1)' }}>{item.nombre}</h3>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors flex-shrink-0">
                    <FaTrash size={13} />
                  </button>
                </div>

                <div className="mt-1 mb-2">
                  <StockBadge disponible={item.stock_disponible} minimo={item.stock_minimo} showCount />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd-1)' }}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)}
                      className="px-3 py-1.5 hover:bg-brand-500/10 transition-colors font-bold text-lg" style={{ color: 'var(--tx-2)' }}>
                      <IoRemoveOutline size={15} />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-bold min-w-[2.5rem] text-center" style={{ color: 'var(--tx-1)' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}
                      disabled={item.qty >= item.stock_disponible}
                      className="px-3 py-1.5 hover:bg-brand-500/10 transition-colors disabled:opacity-40" style={{ color: 'var(--tx-2)' }}>
                      <IoAddOutline size={15} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--tx-3)' }}>{formatCOP(item.precio_unitario)} c/u</p>
                    <p className="text-base font-bold text-brand-600 dark:text-brand-300">{formatCOP(item.precio_unitario * item.qty)}</p>
                  </div>
                </div>

                {item.qty >= item.stock_disponible && item.stock_disponible > 0 && (
                  <p className="text-[11px] text-yellow-600 dark:text-yellow-400 mt-1">Has alcanzado el máximo disponible en stock.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl p-6 space-y-5" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
            <h3 className="font-bold text-lg" style={{ color: 'var(--tx-1)' }}>Resumen</h3>

            <div className="space-y-2">
              {items.map(i => (
                <div key={i.id} className="flex justify-between text-xs" style={{ color: 'var(--tx-3)' }}>
                  <span className="truncate max-w-[60%]">{i.nombre} ×{i.qty}</span>
                  <span className="font-medium">{formatCOP(i.precio_unitario * i.qty)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--bd-1)' }}>
              <span className="font-semibold" style={{ color: 'var(--tx-2)' }}>Total estimado</span>
              <span className="text-2xl font-bold text-brand-600 dark:text-brand-300">{formatCOP(total)}</span>
            </div>

            <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--tx-3)' }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--tx-2)' }}>¿Cómo funciona?</p>
              <p>Al confirmar, reservamos el stock para ti. Un asesor te contactará al <strong>{user?.telefono || 'número registrado'}</strong> para coordinar el pago y entrega.</p>
            </div>

            {!user?.identificacion ? (
              <div className="rounded-xl p-3.5 text-xs" style={{ backgroundColor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
                <p className="flex items-center gap-1.5 font-semibold mb-1" style={{ color: 'var(--tx-1)' }}>
                  <FaFileInvoice size={12} className="text-yellow-500"/> Datos de facturación incompletos
                </p>
                <p className="mb-2" style={{ color: 'var(--tx-2)' }}>
                  Debes completar tu NIT o cédula, dirección y datos fiscales antes de confirmar.
                </p>
                <Link to="/perfil" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                  Ir a mi perfil →
                </Link>
              </div>
            ) : (
              <button onClick={() => setConfirmModal(true)}
                className="btn-primary w-full justify-center py-3.5 text-sm">
                Confirmar Stock
              </button>
            )}

            <a href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent('Hola, quisiera cotizar productos.')}`}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors"
              style={{ border: '1px solid rgba(34,197,94,0.3)' }}>
              <FaWhatsapp size={15} /> Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Modal confirmación */}
      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Confirmar reserva de stock" size="md">
        <p className="text-sm mb-5" style={{ color: 'var(--tx-2)' }}>
          ¿Estás seguro de que deseas reservar estos productos? Un asesor te contactará para cerrar la venta.
        </p>
        <div className="space-y-2 mb-5">
          {items.map(i => (
            <div key={i.id} className="flex justify-between text-sm p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <span style={{ color: 'var(--tx-1)' }}>{i.nombre} ×{i.qty}</span>
              <span className="font-semibold text-brand-600 dark:text-brand-300">{formatCOP(i.precio_unitario * i.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-base pt-2 px-3">
            <span style={{ color: 'var(--tx-1)' }}>Total</span>
            <span className="text-brand-600 dark:text-brand-300">{formatCOP(total)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleConfirm} disabled={loading}
            className="btn-primary flex-1 justify-center py-3 disabled:opacity-60">
            {loading ? 'Procesando...' : 'Confirmar'}
          </button>
          <button onClick={() => setConfirmModal(false)} className="btn-outline flex-1 justify-center">Cancelar</button>
        </div>
      </Modal>

      {/* Modal éxito */}
      <Modal isOpen={successModal} onClose={() => { setSuccessModal(false); navigate('/') }} title="" size="md">
        <div className="text-center py-4">
          <FaCheckCircle size={52} className="mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--tx-1)' }}>¡Cotización reservada!</h3>
          <p className="text-2xl font-mono font-bold text-brand-600 dark:text-brand-300 mb-3">#{orderId}</p>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--tx-2)' }}>
            Un asesor de MANHID se comunicará contigo al <strong>{user?.telefono}</strong> en el menor tiempo posible para coordinar el pago y el envío. ¡Gracias por preferirnos!
          </p>
          <button onClick={() => { setSuccessModal(false); navigate('/') }} className="btn-primary">
            Volver al inicio
          </button>
        </div>
      </Modal>
    </div>
  )
}
