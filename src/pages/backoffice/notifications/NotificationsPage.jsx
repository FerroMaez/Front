import { useEffect, useState } from 'react'
import { FaBell, FaExclamationTriangle, FaShoppingCart, FaCheck, FaTrash } from 'react-icons/fa'
import { useNotificationStore } from '../../../store/notificationStore'
import { mockProducts } from '../../../features/catalog/mockProducts'

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll, addNotification } = useNotificationStore()
  const [wsStatus, setWsStatus] = useState('connecting')

  // Simular WebSocket — en producción conectaría al endpoint real
  useEffect(() => {
    setWsStatus('connected')
    const stockAlerts = mockProducts
      .filter(p => p.stock_disponible <= p.stock_minimo && p.stock_disponible >= 0)
      .slice(0, 3)

    stockAlerts.forEach((p, i) => {
      setTimeout(() => {
        addNotification({
          tipo: 'STOCK_MINIMO',
          titulo: `⚠️ Stock bajo: ${p.nombre}`,
          descripcion: `${p.stock_disponible} unidades disponibles (Mínimo: ${p.stock_minimo})`,
          productoId: p.id,
        })
      }, i * 800)
    })

    return () => setWsStatus('disconnected')
  }, [])  // eslint-disable-line

  const TYPE_CONFIG = {
    STOCK_MINIMO: { icon: <FaExclamationTriangle size={14}/>, bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-300' },
    NUEVA_ORDEN:  { icon: <FaShoppingCart size={14}/>,        bg: 'bg-brand-500/10 border-brand-500/20 text-brand-600 dark:text-brand-300' },
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Notificaciones</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--tx-3)' }}>
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
            {' · '}
            <span className={`font-semibold ${wsStatus === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
              {wsStatus === 'connected' ? '● Conectado' : '○ Reconectando…'}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-outline text-xs py-2 px-4">Marcar todo leído</button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors border border-red-500/20">
              <FaTrash size={11}/> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Info WebSocket */}
      <div className="mb-5 p-4 rounded-2xl text-sm" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
        <div className="flex items-center gap-2 mb-1">
          <FaBell className="text-brand-500" size={14}/>
          <p className="font-semibold" style={{ color: 'var(--tx-1)' }}>Canal WebSocket — /topic/alertas & /topic/ordenes</p>
        </div>
        <p className="text-xs" style={{ color: 'var(--tx-3)' }}>
          Recibirás notificaciones automáticas cuando: un producto alcance su stock mínimo, o un cliente confirme una nueva cotización.
          La latencia objetivo es &lt;500ms. Si la conexión se pierde, se intentará reconexión automática.
        </p>
      </div>

      {/* Lista */}
      {notifications.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
          <FaBell size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--tx-3)' }} />
          <p className="font-semibold" style={{ color: 'var(--tx-2)' }}>Sin notificaciones pendientes</p>
          <p className="text-sm mt-1" style={{ color: 'var(--tx-3)' }}>Todo el inventario está bajo control</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const cfg = TYPE_CONFIG[n.tipo] || TYPE_CONFIG.STOCK_MINIMO
            return (
              <div key={n.id}
                className={`flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer hover:opacity-90 border ${cfg.bg} ${!n.read ? 'opacity-100' : 'opacity-60'}`}
                onClick={() => markRead(n.id)}>
                <span className="mt-0.5 flex-shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{n.titulo}</p>
                  <p className="text-xs mt-0.5 opacity-80">{n.descripcion}</p>
                  <p className="text-[10px] mt-1 opacity-50">
                    {new Date(n.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />}
                {n.read && <FaCheck size={11} className="flex-shrink-0 mt-1 opacity-50" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
