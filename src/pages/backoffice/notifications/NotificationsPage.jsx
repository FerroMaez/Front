import { useEffect, useState } from 'react'
import { FaBell, FaExclamationTriangle, FaShoppingCart, FaCheck, FaTrash } from 'react-icons/fa'
import { useNotificationStore } from '../../../store/notificationStore'
import { websocketService } from '../../../services/api/websocketService'
import { dashboardService } from '../../../services/api/dashboardService'
import { formatCOP } from '../../../utils/formatters'

let stockSeeded = false

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll, addNotification } = useNotificationStore()
  const [wsStatus, setWsStatus] = useState('connecting')

  useEffect(() => {
    // Carga alertas de stock crítico actuales al entrar (solo una vez por sesión)
    if (!stockSeeded) {
      stockSeeded = true
      dashboardService.getStats().then(stats => {
        stats.productosStockCritico.forEach(p => {
          addNotification({
            tipo: 'STOCK_MINIMO',
            titulo: `⚠️ Stock bajo: ${p.nombre}`,
            descripcion: `${p.stock_disponible} uds disponibles (mínimo: ${p.stock_minimo})`,
            productoId: p.id,
          })
        })
      }).catch(() => {})
    }

    websocketService.connect({
      onStatusChange: setWsStatus,
      onAlerta: (data) => {
        addNotification({
          tipo: 'STOCK_MINIMO',
          titulo: `⚠️ Stock bajo: ${data.nombre}`,
          descripcion: `${data.stockDisponible} uds disponibles (mínimo: ${data.stockMinimo})`,
          productoId: data.productoId,
        })
      },
      onNuevaOrden: (data) => {
        addNotification({
          tipo: 'NUEVA_ORDEN',
          titulo: `🛒 Nueva cotización #${data.ordenId}`,
          descripcion: `Total: ${formatCOP(data.total)}`,
          ordenId: data.ordenId,
        })
      },
    })

    return () => websocketService.disconnect()
  }, []) // eslint-disable-line

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
            <span className={`font-semibold ${wsStatus === 'connected' ? 'text-green-500' : 'text-yellow-500'}`}>
              {wsStatus === 'connected' ? '● En vivo' : '○ Conectando…'}
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

      {/* Estado WebSocket */}
      <div className="mb-5 p-4 rounded-2xl text-sm" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
        <div className="flex items-center gap-2 mb-1">
          <FaBell className="text-brand-500" size={14}/>
          <p className="font-semibold" style={{ color: 'var(--tx-1)' }}>Tiempo real — /topic/alertas & /topic/ordenes</p>
        </div>
        <p className="text-xs" style={{ color: 'var(--tx-3)' }}>
          Recibirás alertas automáticas cuando un producto alcance stock mínimo o un cliente confirme una cotización.
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
