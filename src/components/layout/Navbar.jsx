import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FaInstagram, FaFacebook, FaWhatsapp, FaChevronDown } from 'react-icons/fa'
import { IoMenuOutline, IoCloseOutline, IoSunnyOutline, IoMoonOutline } from 'react-icons/io5'
import { companyInfo, catalogProducts } from '../../features/catalog/catalogData'
import { useThemeStore } from '../../store/themeStore'
import clsx from 'clsx'

const navLinks = [
  { label: 'Inicio',        to: '/' },
  { label: 'Catálogo',      to: '/catalogo' },
  { label: 'Quiénes Somos', to: '/quienes-somos' },
  { label: 'Mantenimientos',to: '/mantenimientos' },
  { label: 'Contáctanos',   to: '/contacto' },
]

export default function Navbar() {
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const dropdownRef = useRef(null)
  const navigate    = useNavigate()
  const { theme, toggle } = useThemeStore()
  const isDark = theme === 'dark'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setServicesOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const goToService = (slug) => {
    setServicesOpen(false)
    setMobileOpen(false)
    navigate(`/servicios/${slug}`)
  }

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-nav)',
        boxShadow: scrolled ? 'var(--nav-shadow)' : '0 1px 0 var(--bd-1)',
        backdropFilter: 'blur(16px)',
      }}
      className="sticky top-0 z-40 transition-shadow duration-300"
    >
      {/* Línea de acento top */}
      <div className="h-[2.5px] bg-gradient-to-r from-transparent via-brand-500/70 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <img
                src="/newLogo3.jpeg"
                alt="MANHID"
                className="h-9 w-9 lg:h-10 lg:w-10 rounded-xl object-cover ring-2 ring-brand-500/40 group-hover:ring-brand-500/80 transition-all duration-200"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2"
                style={{ borderColor: 'var(--bg-nav)' }} />
            </div>
            <div>
              <p className="font-bold text-base lg:text-[17px] leading-none tracking-wide" style={{ color: 'var(--tx-1)' }}>
                MANHID
              </p>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-brand-500 dark:text-brand-400 mt-0.5">
                Sistemas Hidráulicos
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                    isActive ? 'text-brand-600 dark:text-brand-300' : 'hover:bg-bd-1',
                  )
                }
                style={({ isActive }) => ({ color: isActive ? undefined : 'var(--tx-2)' })}
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 rounded-full bg-brand-500" />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* Servicios dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{ color: servicesOpen ? 'var(--tx-1)' : 'var(--tx-2)' }}
              >
                Servicios
                <FaChevronDown
                  size={10}
                  className={clsx('opacity-60 transition-transform duration-200', servicesOpen && 'rotate-180')}
                />
              </button>

              {servicesOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 rounded-2xl overflow-hidden shadow-xl z-50"
                  style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}
                >
                  <div className="p-1.5">
                    {catalogProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => goToService(p.slug)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl text-xs font-medium hover:bg-brand-500/10 transition-colors duration-150 group"
                        style={{ color: 'var(--tx-2)' }}
                      >
                        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--bd-1)' }}>
                          <img src={p.imagen} alt={p.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <span style={{ color: 'var(--tx-1)' }}>{p.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Social */}
            <div className="hidden md:flex items-center gap-0.5">
              <a href={companyInfo.social.instagram} target="_blank" rel="noreferrer"
                className="p-2 rounded-lg hover:bg-brand-500/10 transition-colors"
                style={{ color: 'var(--tx-3)' }}>
                <FaInstagram size={16} />
              </a>
              <a href={companyInfo.social.facebook} target="_blank" rel="noreferrer"
                className="p-2 rounded-lg hover:bg-brand-500/10 transition-colors"
                style={{ color: 'var(--tx-3)' }}>
                <FaFacebook size={16} />
              </a>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label="Cambiar tema"
              className="p-2 rounded-xl hover:bg-brand-500/10 transition-all duration-200 hover:scale-110"
              style={{ color: 'var(--tx-2)' }}
            >
              {isDark
                ? <IoSunnyOutline size={19} className="text-brand-300" />
                : <IoMoonOutline  size={19} className="text-brand-600" />}
            </button>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-green-900/30 hover:-translate-y-px"
            >
              <FaWhatsapp size={13} />
              WhatsApp
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-brand-500/10 transition-colors"
              style={{ color: 'var(--tx-2)' }}
            >
              {mobileOpen ? <IoCloseOutline size={22} /> : <IoMenuOutline size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ backgroundColor: 'var(--bg-raised)', borderTop: '1px solid var(--bd-1)' }}>
          <nav className="px-3 py-3 space-y-0.5">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  clsx('block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive ? 'text-brand-600 dark:text-brand-300 bg-brand-500/10' : '')
                }
                style={({ isActive }) => ({ color: isActive ? undefined : 'var(--tx-2)' })}
              >
                {label}
              </NavLink>
            ))}

            <div className="pt-2 pb-1" style={{ borderTop: '1px solid var(--bd-1)' }}>
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ color: 'var(--tx-3)' }}>
                Servicios
              </p>
              {catalogProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => goToService(p.slug)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm rounded-xl hover:bg-brand-500/10 transition-colors"
                  style={{ color: 'var(--tx-2)' }}
                >
                  <img src={p.imagen} alt={p.nombre} className="w-7 h-7 rounded-lg object-cover" />
                  <span>{p.nombre}</span>
                </button>
              ))}
            </div>

            {/* Mobile bottom actions */}
            <div className="pt-2 flex gap-2" style={{ borderTop: '1px solid var(--bd-1)' }}>
              <button onClick={toggle}
                className="p-2.5 rounded-xl hover:bg-brand-500/10 transition-colors"
                style={{ color: 'var(--tx-2)' }}>
                {isDark ? <IoSunnyOutline size={18} /> : <IoMoonOutline size={18} />}
              </button>
              <a href={companyInfo.social.instagram} target="_blank" rel="noreferrer"
                className="p-2.5 rounded-xl hover:bg-brand-500/10 transition-colors"
                style={{ color: 'var(--tx-3)' }}>
                <FaInstagram size={17} />
              </a>
              <a href={companyInfo.social.facebook} target="_blank" rel="noreferrer"
                className="p-2.5 rounded-xl hover:bg-brand-500/10 transition-colors"
                style={{ color: 'var(--tx-3)' }}>
                <FaFacebook size={17} />
              </a>
              <a
                href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <FaWhatsapp size={15} /> WhatsApp
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
