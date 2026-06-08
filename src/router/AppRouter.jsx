import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import PageWrapper from '../components/layout/PageWrapper'
import BackofficeLayout from '../components/layout/BackofficeLayout'

// Public pages
import HomePage          from '../pages/home/HomePage'
import CatalogPage       from '../pages/catalog/CatalogPage'
import ServicePage       from '../pages/catalog/ServicePage'
import MaintenancePage   from '../pages/maintenance/MaintenancePage'
import ContactPage       from '../pages/contact/ContactPage'
import AboutPage         from '../pages/about/AboutPage'

// Auth
import LoginPage         from '../pages/auth/LoginPage'
import RegisterPage      from '../pages/auth/RegisterPage'

// Client private
import CartPage          from '../pages/cart/CartPage'
import ProfilePage       from '../pages/profile/ProfilePage'

// Backoffice
import DashboardPage     from '../pages/backoffice/dashboard/DashboardPage'
import InventoryPage     from '../pages/backoffice/inventory/InventoryPage'
import OrdersPage        from '../pages/backoffice/orders/OrdersPage'
import NotificationsPage from '../pages/backoffice/notifications/NotificationsPage'

/** @param {{ children: import('react').ReactNode }} props */
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

/** @param {{ children: import('react').ReactNode }} props */
function RequireJefe({ children }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.rol !== 'JEFE') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Pública ─────────────────────────────────── */}
        <Route element={<PageWrapper />}>
          <Route path="/"               element={<HomePage />} />
          <Route path="/catalogo"       element={<CatalogPage />} />
          <Route path="/servicios/:slug" element={<ServicePage />} />
          <Route path="/mantenimientos" element={<MaintenancePage />} />
          <Route path="/contacto"       element={<ContactPage />} />
          <Route path="/quienes-somos"  element={<AboutPage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/registro"       element={<RegisterPage />} />

          {/* ── Cliente autenticado ───────────────────── */}
          <Route path="/carrito" element={<RequireAuth><CartPage /></RequireAuth>} />
          <Route path="/perfil"  element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/historial" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        </Route>

        {/* ── Backoffice ───────────────────────────────── */}
        <Route path="/backoffice" element={<RequireJefe><BackofficeLayout /></RequireJefe>}>
          <Route index                element={<DashboardPage />} />
          <Route path="inventario"    element={<InventoryPage />} />
          <Route path="ordenes"       element={<OrdersPage />} />
          <Route path="notificaciones" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
