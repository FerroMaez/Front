import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import HomePage from '../pages/home/HomePage'
import CatalogPage from '../pages/catalog/CatalogPage'
import ServicePage from '../pages/catalog/ServicePage'
import MaintenancePage from '../pages/maintenance/MaintenancePage'
import ContactPage from '../pages/contact/ContactPage'
import AboutPage from '../pages/about/AboutPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageWrapper />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/servicios/:slug" element={<ServicePage />} />
          <Route path="/mantenimientos" element={<MaintenancePage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/quienes-somos" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
