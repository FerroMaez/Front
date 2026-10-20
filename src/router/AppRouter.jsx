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
import LoginPage              from '../pages/auth/LoginPage'
import PoliticaPrivacidadPage   from '../pages/legal/PoliticaPrivacidadPage'

// Client private
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

/** Backoffice: JEFE (todo) y EMPLEADO (solo Órdenes). @param {{ children: import('react').ReactNode }} props */
function RequireBackoffice({ children }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!['JEFE', 'EMPLEADO'].includes(user?.rol)) return <Navigate to="/" replace />
  return <>{children}</>
}

/**
 * Páginas solo del JEFE. Un EMPLEADO que entre por URL se manda a Órdenes (su única página).
 * El backend también lo bloquea: esto es solo para no mostrarle pantallas que darían 403.
 * @param {{ children: import('react').ReactNode }} props
 */
function RequireJefe({ children }) {
  const { user } = useAuthStore()
  if (user?.rol !== 'JEFE') return <Navigate to="/backoffice/ordenes" replace />
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
          <Route path="/login"               element={<LoginPage />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidadPage />} />

          {/* ── Usuario autenticado ───────────────────── */}
          <Route path="/perfil"  element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/historial" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        </Route>

        {/* ── Backoffice ───────────────────────────────── */}
        <Route path="/backoffice" element={<RequireBackoffice><BackofficeLayout /></RequireBackoffice>}>
          <Route index                element={<RequireJefe><DashboardPage /></RequireJefe>} />
          <Route path="inventario"    element={<RequireJefe><InventoryPage key="inventario" /></RequireJefe>} />
          <Route path="arreglos"      element={<RequireJefe><InventoryPage key="arreglos" tipoInventario="ARREGLO" titulo="Arreglos" /></RequireJefe>} />
          {/* key distinto: al cambiar de hoja React monta la página de cero (sin estado de la anterior) */}
          <Route path="bodega"        element={<RequireJefe><InventoryPage key="bodega" tipoInventario="BODEGA" titulo="Bodega" /></RequireJefe>} />
          <Route path="ordenes"       element={<OrdersPage />} />
          <Route path="notificaciones" element={<RequireJefe><NotificationsPage /></RequireJefe>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
