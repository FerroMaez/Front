import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FaUser, FaPhone, FaEnvelope, FaEdit, FaCheck, FaRedo,
  FaShoppingCart, FaClipboardList, FaBoxOpen, FaArrowRight,
} from 'react-icons/fa'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { orderService } from '../../services/api/orderService'
import { authService } from '../../services/api/authService'
import { formatCOP, formatDate } from '../../utils/formatters'

const STATUS_CONFIG = {
  PENDIENTE:      { label: 'Pendiente',     cls: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 border-yellow-500/25' },
  EN_PROCESO:     { label: 'En proceso',    cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/25' },
  VENTA_EXITOSA:  { label: 'Exitosa ✓',    cls: 'bg-green-500/10 text-green-600 dark:text-green-300 border-green-500/25' },
  CANCELADA:      { label: 'Cancelada',     cls: 'bg-red-500/10 text-red-500 border-red-500/25' },
}

export default function ProfilePage() {
  const { user, setUser }         = useAuthStore()
  const { addItem, openCart, getCount } = useCartStore()
  const cartCount = getCount()

  const [orders,    setOrders]    = useState([])
  const [editing,   setEditing]   = useState(false)
  const [form,      setForm]      = useState({ nombre: user?.nombre || '', telefono: user?.telefono || '' })
  const [saved,     setSaved]     = useState(false)
  const [saveErr,   setSaveErr]   = useState('')
  const [reorderMsg, setReorderMsg] = useState('')

  useEffect(() => {
    orderService.getMyOrders().then(setOrders).catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaveErr('')
    try {
      const updated = await authService.updateProfile({ nombre: form.nombre, telefono: form.telefono })
      setUser({ ...user, ...updated })
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setSaveErr('No se pudo actualizar el perfil. Intenta de nuevo.')
    }
  }

  const handleReorder = (order) => {
    let added = 0
    let outOfStock = 0
    order.items?.forEach(item => {
      if (item.precio_unitario_momento > 0) {
        addItem({
          id: item.producto_id,
          nombre: item.nombre,
          precio_unitario: item.precio_unitario_momento,
          stock_disponible: 99,
          stock_minimo: 1,
          imagen_url: '',
        }, item.cantidad)
        added++
      } else {
        outOfStock++
      }
    })
    if (added === 0) {
      setReorderMsg('Lo sentimos, los productos de esta cotización no tienen stock disponible actualmente.')
    } else {
      setReorderMsg(outOfStock > 0 ? `${added} producto(s) agregados. ${outOfStock} sin stock disponible.` : `${added} producto(s) agregados al carrito.`)
      openCart()
    }
    setTimeout(() => setReorderMsg(''), 3500)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Welcome banner */}
      <div className="relative rounded-3xl overflow-hidden mb-8 p-6 sm:p-8"
        style={{ background: 'linear-gradient(135deg, rgba(140,144,59,0.18) 0%, rgba(140,144,59,0.06) 100%)', border: '1px solid rgba(140,144,59,0.25)' }}>
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8C903B, #6f7230)' }}>
            {user?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-0.5">Mi cuenta</p>
            <h1 className="text-2xl sm:text-3xl font-bold truncate" style={{ color: 'var(--tx-1)' }}>
              ¡Hola, {user?.nombre?.split(' ')[0]}!
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--tx-3)' }}>
              Gestiona tu perfil y consulta tus cotizaciones
            </p>
          </div>
          {cartCount > 0 && (
            <Link to="/carrito"
              className="hidden sm:flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm text-white transition-all hover:-translate-y-px"
              style={{ background: 'linear-gradient(135deg, #8C903B, #6f7230)', boxShadow: '0 4px 16px -4px rgba(140,144,59,0.4)' }}>
              <FaShoppingCart size={15} />
              Ver cotización ({cartCount})
            </Link>
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon: <FaBoxOpen size={18}/>,      label: 'Ver Catálogo',    to: '/catalogo',     color: 'rgba(140,144,59,0.12)' },
          { icon: <FaShoppingCart size={18}/>, label: 'Mi Cotización',   to: '/carrito',      color: 'rgba(34,197,94,0.10)',  badge: cartCount > 0 ? cartCount : null },
          { icon: <FaClipboardList size={18}/>,label: 'Solicitar Mant.', to: '/mantenimientos', color: 'rgba(99,102,241,0.10)' },
        ].map(({ icon, label, to, color, badge }) => (
          <Link key={to} to={to}
            className="relative flex items-center gap-3 p-4 rounded-2xl font-medium text-sm transition-all hover:-translate-y-1"
            style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-brand-600 dark:text-brand-400" style={{ backgroundColor: color }}>
              {icon}
            </div>
            <span style={{ color: 'var(--tx-1)' }}>{label}</span>
            {badge && <span className="ml-auto px-2 py-0.5 bg-brand-600 text-white text-[10px] font-bold rounded-full">{badge}</span>}
            <FaArrowRight size={10} className="ml-auto flex-shrink-0" style={{ color: 'var(--tx-3)' }} />
          </Link>
        ))}
      </div>

      {reorderMsg && (
        <div className="mb-5 p-3.5 rounded-xl text-sm font-medium" style={{ backgroundColor: 'rgba(140,144,59,0.1)', border: '1px solid rgba(140,144,59,0.25)', color: 'var(--tx-1)' }}>
          {reorderMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Datos personales ─────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-base" style={{ color: 'var(--tx-1)' }}>Datos personales</h2>
              {!editing && (
                <button onClick={() => { setEditing(true); setForm({ nombre: user?.nombre || '', telefono: user?.telefono || '' }) }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                  <FaEdit size={11} /> Editar
                </button>
              )}
            </div>

            {saved && (
              <div className="mb-4 flex items-center gap-2 text-xs font-medium rounded-xl p-3"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#16a34a' }}>
                <FaCheck size={11} /> Datos actualizados correctamente
              </div>
            )}

            {saveErr && (
              <div className="mb-4 p-3 rounded-xl text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20">
                {saveErr}
              </div>
            )}

            {editing ? (
              <div className="space-y-4">
                {[
                  { k: 'nombre',   l: 'Nombre completo', t: 'text' },
                  { k: 'telefono', l: 'Teléfono',         t: 'tel'  },
                ].map(({ k, l, t }) => (
                  <div key={k}>
                    <label htmlFor={`pf-${k}`} className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--tx-3)' }}>{l}</label>
                    <input id={`pf-${k}`} type={t} value={form[k]}
                      onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button onClick={handleSave} className="btn-primary text-xs py-2 px-4">Guardar</button>
                  <button onClick={() => setEditing(false)} className="btn-outline text-xs py-2 px-4">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { icon: <FaUser size={13} />,     label: 'Nombre',   val: user?.nombre },
                  { icon: <FaEnvelope size={13} />, label: 'Email',    val: user?.email },
                  { icon: <FaPhone size={13} />,    label: 'Teléfono', val: user?.telefono },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="flex items-start gap-3 p-3.5 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
                    <span className="mt-0.5 text-brand-500 flex-shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--tx-3)' }}>{label}</p>
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--tx-1)' }}>{val || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Historial de cotizaciones ─────────────────── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base" style={{ color: 'var(--tx-1)' }}>Mis cotizaciones</h2>
            <Link to="/catalogo" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              Nueva cotización <FaArrowRight size={10} />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
              <FaClipboardList size={36} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--tx-3)' }} />
              <p className="font-semibold" style={{ color: 'var(--tx-2)' }}>Aún no tienes cotizaciones confirmadas</p>
              <p className="text-sm mt-1 mb-5" style={{ color: 'var(--tx-3)' }}>¡Explora nuestro catálogo y crea tu primera cotización!</p>
              <Link to="/catalogo" className="btn-primary text-sm">Ver catálogo</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const cfg = STATUS_CONFIG[order.estado] || STATUS_CONFIG.PENDIENTE
                return (
                  <div key={order.id} className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 p-4" style={{ borderBottom: '1px solid var(--bd-1)' }}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-brand-600 dark:text-brand-300">#{order.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.cls}`}>{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs" style={{ color: 'var(--tx-3)' }}>{formatDate(order.fecha_creacion)}</span>
                        <span className="font-bold text-sm text-brand-600 dark:text-brand-300">{formatCOP(order.total_cotizacion)}</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-4 space-y-1.5">
                      {order.items?.map(item => (
                        <div key={item.producto_id} className="flex justify-between text-xs" style={{ color: 'var(--tx-2)' }}>
                          <span>{item.nombre} <span style={{ color: 'var(--tx-3)' }}>×{item.cantidad}</span></span>
                          <span className="font-medium">{formatCOP(item.precio_unitario_momento * item.cantidad)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 pb-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--bd-1)', paddingTop: '12px' }}>
                      <span className="text-xs" style={{ color: 'var(--tx-3)' }}>
                        {order.items?.length} producto(s)
                      </span>
                      {order.estado === 'VENTA_EXITOSA' && (
                        <button onClick={() => handleReorder(order)}
                          className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline transition-colors">
                          <FaRedo size={10} /> Volver a pedir
                        </button>
                      )}
                      {order.estado === 'CANCELADA' && order.motivo_cancelacion && (
                        <span className="text-xs text-red-500">{order.motivo_cancelacion}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
