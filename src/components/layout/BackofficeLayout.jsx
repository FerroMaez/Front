import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FaTachometerAlt, FaBoxes, FaTools, FaClipboardList, FaBell, FaSignOutAlt, FaBars, FaTimes, FaWifi, FaWarehouse } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { useThemeStore } from '../../store/themeStore'
import { websocketService } from '../../services/api/websocketService'
import { dashboardService } from '../../services/api/dashboardService'
import { formatCOP } from '../../utils/formatters'
import { useOfflineStore } from '../../store/offlineStore'
import { ventasOfflineSync } from '../../services/offline/ventasOfflineSync'
import { precargarImagenes } from '../../services/offline/serviceWorker'
import { productService } from '../../services/api/productService'
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5'
import clsx from 'clsx'

export default function BackofficeLayout() {
  const { user, logout } = useAuthStore()
  const { unreadCount, addNotification } = useNotificationStore()
  const { theme, toggle }         = useThemeStore()
  const navigate                  = useNavigate()
  const [sideOpen, setSideOpen]   = useState(false)
  const [toasts, setToasts]       = useState([])
  const { online, ventas: ventasOffline } = useOfflineStore()
  const rechazadas = ventasOffline.filter(v => v.estado === 'RECHAZADA').length
  const pendientes = ventasOffline.length - rechazadas

  // El EMPLEADO solo ve Órdenes: sin dashboard, inventario ni alertas de stock.
  const esJefe = user?.rol === 'JEFE'

  const handleLogout = () => { logout(); navigate('/') }

  // WebSocket GLOBAL: se conecta al entrar al backoffice y escucha alertas en
  // TODA la sesión (no solo en la página de Notificaciones). Muestra un toast
  // visible al instante y alimenta el store (badge + lista). Antes la conexión
  // vivía dentro de NotificationsPage y se cortaba al salir de esa pantalla.
  useEffect(() => {
    // Semilla: alertas de stock crítico actuales (una vez por carga de la app). Solo JEFE.
    if (esJefe && !window.__manhidSeeded) {
      window.__manhidSeeded = true
      dashboardService.getStats().then(stats => {
        (stats?.productosStockCritico || []).forEach(p => addNotification({
          tipo: 'STOCK_MINIMO',
          titulo: `⚠️ Stock bajo: ${p.nombre}`,
          descripcion: `${p.stock_disponible} uds disponibles (mínimo: ${p.stock_minimo})`,
          productoId: p.id,
        }))
      }).catch(() => {})
    }

    const pushToast = (t) => {
      const id = Date.now() + Math.random()
      setToasts(prev => [...prev, { id, ...t }])
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 6000)
    }

    websocketService.connect()
    const unsubAlerta = websocketService.onAlerta((data) => {
      const n = {
        tipo: 'STOCK_MINIMO',
        titulo: `⚠️ Stock bajo: ${data.nombre}`,
        descripcion: `${data.stockDisponible} uds disponibles (mínimo: ${data.stockMinimo})`,
        productoId: data.productoId,
      }
      addNotification(n); pushToast(n)
    })
    const unsubOrden = websocketService.onOrden((data) => {
      const n = {
        tipo: 'NUEVA_ORDEN',
        titulo: `🛒 Nueva cotización #${data.ordenId}`,
        descripcion: `Total: ${formatCOP(data.total)}`,
        ordenId: data.ordenId,
      }
      addNotification(n); pushToast(n)
    })
    // Cola de ventas offline: se sincroniza sola al volver el internet.
    ventasOfflineSync.iniciar()
    // Guarda las imágenes de todos los productos para que se vean aunque se caiga el wifi.
    productService.getAll()
      .then(r => precargarImagenes(['/newLogo3.jpeg', ...r.data.map(p => p.imagen_url)]))
      .catch(() => {})
    const unsubOffline = ventasOfflineSync.onResultado((r) => {
      if (r.estado === 'DUPLICADA') return   // ya estaba registrada: nada que avisar
      const n = r.estado === 'RECHAZADA'
        ? { tipo: 'VENTA_OFFLINE_RECHAZADA', titulo: '⚠️ Venta sin internet rechazada', descripcion: r.motivo }
        : { tipo: 'VENTA_OFFLINE', titulo: `✅ Venta sin internet registrada #${r.ordenId}`, descripcion: `${r.clienteNombre || ''} · ${formatCOP(r.total)}` }
      addNotification(n); pushToast(n)
    })
    // No desconectamos: la conexión persiste mientras el JEFE esté en el panel.
    return () => { unsubAlerta(); unsubOrden(); unsubOffline() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const links = [
    { to: '/backoffice',               label: 'Dashboard',  icon: <FaTachometerAlt size={15}/>, exact: true, soloJefe: true },
    { to: '/backoffice/inventario',    label: 'Inventario', icon: <FaBoxes size={15}/>, soloJefe: true },
    { to: '/backoffice/arreglos',      label: 'Arreglos',   icon: <FaTools size={15}/>, soloJefe: true },
    { to: '/backoffice/bodega',        label: 'Bodega',     icon: <FaWarehouse size={15}/>, soloJefe: true },
    { to: '/backoffice/ordenes',       label: 'Órdenes',    icon: <FaClipboardList size={15}/> },
    { to: '/backoffice/notificaciones', label: 'Alertas',   icon: <FaBell size={15}/>, badge: unreadCount, soloJefe: true },
  ].filter(l => esJefe || !l.soloJefe)

  const SideNav = ({ onClick }) => (
    <nav className="flex flex-col gap-1 p-3">
      {links.map(l => (
        <NavLink key={l.to} to={l.to} end={l.exact}
          onClick={onClick}
          className={({ isActive }) => clsx(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
            isActive
              ? 'bg-brand-600/20 text-brand-600 dark:text-brand-300 border border-brand-500/30'
              : 'hover:bg-brand-500/8 border border-transparent',
          )}
          style={({ isActive }) => ({ color: isActive ? undefined : 'var(--tx-2)' })}>
          <span>{l.icon}</span>
          <span>{l.label}</span>
          {l.badge > 0 && <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{l.badge}</span>}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Toasts globales de alertas en tiempo real */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map(t => (
          <button key={t.id} type="button" onClick={() => navigate('/backoffice/notificaciones')}
            className="text-left px-4 py-3 rounded-2xl shadow-xl text-white transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: t.tipo === 'NUEVA_ORDEN' ? '#6b7030' : '#b45309' }}>
            <p className="font-semibold text-sm">{t.titulo}</p>
            <p className="text-xs opacity-90 mt-0.5">{t.descripcion}</p>
          </button>
        ))}
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14" style={{ backgroundColor: 'var(--bg-nav)', boxShadow: '0 1px 0 var(--bd-1)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setSideOpen(!sideOpen)} className="lg:hidden p-2 rounded-lg hover:bg-brand-500/10 transition-colors" style={{ color: 'var(--tx-2)' }}>
            {sideOpen ? <FaTimes size={18}/> : <FaBars size={18}/>}
          </button>
          <div className="flex items-center gap-2">
            <img src="/newLogo3.jpeg" alt="MANHID" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-bold text-sm" style={{ color: 'var(--tx-1)' }}>MANHID</span>
            <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'rgba(140,144,59,0.12)', color: 'var(--tx-2)' }}>Backoffice</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(!online || ventasOffline.length > 0) && (
            <button onClick={() => navigate('/backoffice/ordenes')}
              title="Ventas guardadas en este equipo sin internet"
              className={clsx('flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border',
                !online || rechazadas > 0
                  ? 'bg-red-500/10 border-red-500/25 text-red-500'
                  : 'bg-yellow-500/10 border-yellow-500/25 text-yellow-600 dark:text-yellow-300')}>
              <FaWifi size={12} />
              {!online && <span>Sin conexión</span>}
              {pendientes > 0 && <span>{pendientes} por sincronizar</span>}
              {rechazadas > 0 && <span>{rechazadas} rechazada{rechazadas > 1 ? 's' : ''}</span>}
            </button>
          )}
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-brand-500/10 transition-colors" style={{ color: 'var(--tx-2)' }}>
            {theme === 'dark' ? <IoSunnyOutline size={16}/> : <IoMoonOutline size={16}/>}
          </button>
          <span className="hidden sm:block text-xs font-medium px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--tx-2)' }}>
            {user?.nombre} · <span className="text-brand-500">{user?.rol}</span>
          </span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
            <FaSignOutAlt size={12}/> Salir
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-raised)', borderRight: '1px solid var(--bd-1)' }}>
          <SideNav />
        </aside>

        {/* Mobile sidebar overlay */}
        {sideOpen && (
          <>
            <button type="button" aria-label="Cerrar menú" className="lg:hidden fixed inset-0 z-20 w-full h-full" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setSideOpen(false)} />
            <aside className="lg:hidden fixed left-0 top-14 bottom-0 w-56 z-30 overflow-y-auto" style={{ backgroundColor: 'var(--bg-raised)', borderRight: '1px solid var(--bd-1)' }}>
              <SideNav onClick={() => setSideOpen(false)} />
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
