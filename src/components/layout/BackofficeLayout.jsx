import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FaTachometerAlt, FaBoxes, FaClipboardList, FaBell, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { useThemeStore } from '../../store/themeStore'
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5'
import clsx from 'clsx'

export default function BackofficeLayout() {
  const { user, logout } = useAuthStore()
  const { unreadCount }           = useNotificationStore()
  const { theme, toggle }         = useThemeStore()
  const navigate                  = useNavigate()
  const [sideOpen, setSideOpen]   = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const links = [
    { to: '/backoffice',               label: 'Dashboard',  icon: <FaTachometerAlt size={15}/>, exact: true },
    { to: '/backoffice/inventario',    label: 'Inventario', icon: <FaBoxes size={15}/> },
    { to: '/backoffice/ordenes',       label: 'Órdenes',    icon: <FaClipboardList size={15}/> },
    { to: '/backoffice/notificaciones', label: 'Alertas',   icon: <FaBell size={15}/>, badge: unreadCount },
  ]

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
