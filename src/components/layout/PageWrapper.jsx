import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppFloat from '../shared/WhatsAppFloat'
import CartDrawer from '../shared/CartDrawer'
import { useAuthStore } from '../../store/authStore'

export default function PageWrapper() {
  const { pathname }       = useLocation()
  const { isAuthenticated, user } = useAuthStore()
  const isCliente = user?.rol === 'CLIENTE'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      {isAuthenticated && isCliente && <CartDrawer />}
    </div>
  )
}
