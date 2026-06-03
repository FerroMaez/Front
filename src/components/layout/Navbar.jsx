import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FaInstagram, FaFacebook, FaWhatsapp, FaChevronDown, FaShoppingCart, FaUser, FaSignOutAlt, FaHistory, FaUserCircle, FaTachometerAlt } from 'react-icons/fa'
import { IoMenuOutline, IoCloseOutline, IoSunnyOutline, IoMoonOutline } from 'react-icons/io5'
import { companyInfo, catalogProducts } from '../../features/catalog/catalogData'
import { useThemeStore } from '../../store/themeStore'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import clsx from 'clsx'

const publicLinks = [
  { label: 'Inicio',         to: '/' },
  { label: 'Catálogo',       to: '/catalogo' },
  { label: 'Quiénes Somos',  to: '/quienes-somos' },
  { label: 'Mantenimientos', to: '/mantenimientos' },
  { label: 'Contáctanos',    to: '/contacto' },
]

export default function Navbar() {
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [profileOpen,  setProfileOpen]  = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const servicesRef = useRef(null)
  const profileRef  = useRef(null)
  const navigate = useNavigate()
  const { theme, toggle } = useThemeStore()
  const { user, isAuthenticated, logout, isEmpleado } = useAuthStore()
  const { toggleCart, getCount } = useCartStore()
  const cartCount = getCount()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClick = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) setServicesOpen(false)
      if (profileRef.current  && !profileRef.current.contains(e.target))  setProfileOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  const goService = (slug) => { setServicesOpen(false); setMobileOpen(false); navigate(`/servicios/${slug}`) }

  const navbarBg = { backgroundColor: 'var(--bg-nav)', boxShadow: scrolled ? 'var(--nav-shadow)' : '0 1px 0 var(--bd-1)', backdropFilter: 'blur(16px)' }

  return (
    <header style={navbarBg} className="sticky top-0 z-40 transition-shadow duration-300">
      <div className="h-[2.5px] bg-gradient-to-r from-transparent via-brand-500/70 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <img src="/newLogo3.jpeg" alt="MANHID"
                className="h-9 w-9 lg:h-10 lg:w-10 rounded-xl object-cover ring-2 ring-brand-500/40 group-hover:ring-brand-500/80 transition-all" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2" style={{ borderColor: 'var(--bg-nav)' }} />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-base lg:text-[17px] leading-none tracking-wide" style={{ color: 'var(--tx-1)' }}>MANHID</p>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-brand-500 mt-0.5">Sistemas Hidráulicos</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {publicLinks.map(({ label, to }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) => clsx('relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors', isActive ? 'text-brand-600 dark:text-brand-300' : 'hover:bg-brand-500/8')}
                style={({ isActive }) => ({ color: isActive ? undefined : 'var(--tx-2)' })}>
                {({ isActive }) => (<>{label}{isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 rounded-full bg-brand-500" />}</>)}
              </NavLink>
            ))}

            {/* Servicios dropdown */}
            <div className="relative" ref={servicesRef}>
              <button onClick={() => setServicesOpen(!servicesOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--tx-2)' }}>
                Servicios <FaChevronDown size={10} className={clsx('opacity-60 transition-transform', servicesOpen && 'rotate-180')} />
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl overflow-hidden shadow-xl z-50 p-1.5"
                  style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
                  {catalogProducts.map(p => (
                    <button key={p.id} onClick={() => goService(p.slug)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium hover:bg-brand-500/10 transition-colors group"
                      style={{ color: 'var(--tx-2)' }}>
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bd-1)' }}>
                        <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                      </div>
                      <span style={{ color: 'var(--tx-1)' }}>{p.nombre}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <div className="hidden md:flex items-center gap-0.5">
              <a href={companyInfo.social.instagram} target="_blank" rel="noreferrer"
                className="p-2 rounded-lg hover:bg-brand-500/10 transition-colors" style={{ color: 'var(--tx-3)' }}><FaInstagram size={16} /></a>
              <a href={companyInfo.social.facebook} target="_blank" rel="noreferrer"
                className="p-2 rounded-lg hover:bg-brand-500/10 transition-colors" style={{ color: 'var(--tx-3)' }}><FaFacebook size={16} /></a>
            </div>

            {/* Theme toggle */}
            <button onClick={toggle} aria-label="Cambiar tema"
              className="p-2 rounded-xl hover:bg-brand-500/10 transition-all hover:scale-110" style={{ color: 'var(--tx-2)' }}>
              {theme === 'dark' ? <IoSunnyOutline size={19} className="text-brand-300" /> : <IoMoonOutline size={19} className="text-brand-600" />}
            </button>

            {isAuthenticated && isCliente(user) && (
              /* Cart button */
              <button onClick={toggleCart}
                className="relative p-2.5 rounded-xl hover:bg-brand-500/10 transition-all" style={{ color: 'var(--tx-1)' }}>
                <FaShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-brand-600 rounded-full">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated ? (
              /* Profile dropdown */
              <div className="relative hidden md:flex" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-2xl hover:opacity-90 transition-all"
                  style={{ backgroundColor: 'rgba(140,144,59,0.18)', border: '1.5px solid rgba(140,144,59,0.45)' }}>
                  {/* Avatar con inicial */}
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #8C903B, #6f7230)' }}>
                    {user?.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold max-w-[80px] truncate" style={{ color: 'var(--tx-1)' }}>
                    {user?.nombre?.split(' ')[0]}
                  </span>
                  <FaChevronDown size={9} className={clsx('opacity-60 transition-transform flex-shrink-0', profileOpen && 'rotate-180')} style={{ color: 'var(--tx-2)' }} />
                </button>
                {profileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 rounded-2xl overflow-hidden shadow-xl z-50 p-1.5"
                    style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
                    <div className="px-3 py-2 mb-1" style={{ borderBottom: '1px solid var(--bd-1)' }}>
                      <p className="text-xs font-bold" style={{ color: 'var(--tx-1)' }}>{user?.nombre}</p>
                      <p className="text-[10px] text-brand-500 font-semibold uppercase">{user?.rol}</p>
                    </div>
                    {isEmpleado() && (
                      <Link to="/backoffice" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-brand-500/10 transition-colors"
                        style={{ color: 'var(--tx-2)' }}>
                        <FaTachometerAlt size={14} className="text-brand-500" /> Backoffice
                      </Link>
                    )}
                    {!isEmpleado() && (
                      <>
                        <Link to="/perfil" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-brand-500/10 transition-colors"
                          style={{ color: 'var(--tx-2)' }}>
                          <FaUser size={13} className="text-brand-500" /> Mi Perfil
                        </Link>
                        <Link to="/historial" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-brand-500/10 transition-colors"
                          style={{ color: 'var(--tx-2)' }}>
                          <FaHistory size={13} className="text-brand-500" /> Mis Órdenes
                        </Link>
                      </>
                    )}
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-red-500/10 text-red-500 transition-colors">
                      <FaSignOutAlt size={13} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all hover:-translate-y-px shadow-md">
                Iniciar Sesión
              </Link>
            )}

            {/* WhatsApp */}
            <a href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-green-900/30 hover:-translate-y-px">
              <FaWhatsapp size={13} /> WhatsApp
            </a>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-brand-500/10 transition-colors" style={{ color: 'var(--tx-2)' }}>
              {mobileOpen ? <IoCloseOutline size={22} /> : <IoMenuOutline size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ backgroundColor: 'var(--bg-raised)', borderTop: '1px solid var(--bd-1)' }}>
          <nav className="px-3 py-3 space-y-0.5">
            {publicLinks.map(({ label, to }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)}
                className={({ isActive }) => clsx('block px-4 py-2.5 rounded-xl text-sm font-medium', isActive ? 'text-brand-600 dark:text-brand-300 bg-brand-500/10' : '')}
                style={({ isActive }) => ({ color: isActive ? undefined : 'var(--tx-2)' })}>
                {label}
              </NavLink>
            ))}

            <div className="pt-2" style={{ borderTop: '1px solid var(--bd-1)' }}>
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--tx-3)' }}>Servicios</p>
              {catalogProducts.map(p => (
                <button key={p.id} onClick={() => goService(p.slug)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl hover:bg-brand-500/10 transition-colors"
                  style={{ color: 'var(--tx-2)' }}>
                  <img src={p.imagen} alt={p.nombre} className="w-7 h-7 rounded-lg object-cover" />{p.nombre}
                </button>
              ))}
            </div>

            {/* Mobile auth / cart */}
            <div className="pt-2 flex flex-col gap-2" style={{ borderTop: '1px solid var(--bd-1)' }}>
              {isAuthenticated ? (
                <>
                  {/* User info banner */}
                  <div className="flex items-center gap-3 px-3 py-3 rounded-2xl mb-1"
                    style={{ backgroundColor: 'rgba(140,144,59,0.12)', border: '1px solid rgba(140,144,59,0.25)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #8C903B, #6f7230)' }}>
                      {user?.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--tx-1)' }}>{user?.nombre}</p>
                      <p className="text-[10px] font-semibold uppercase text-brand-500">{user?.rol}</p>
                    </div>
                  </div>

                  {!isEmpleado() && (
                    <>
                      <Link to="/perfil" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm hover:bg-brand-500/10 transition-colors font-medium"
                        style={{ color: 'var(--tx-2)' }}>
                        <FaUser size={13} className="text-brand-500"/> Mi Perfil
                      </Link>
                      <Link to="/carrito" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm hover:bg-brand-500/10 transition-colors font-medium"
                        style={{ color: 'var(--tx-2)' }}>
                        <FaShoppingCart size={13} className="text-brand-500"/>
                        Carrito
                        {cartCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-brand-600 text-white text-[10px] rounded-full font-bold">{cartCount}</span>}
                      </Link>
                    </>
                  )}
                  {isEmpleado() && (
                    <Link to="/backoffice" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm hover:bg-brand-500/10 font-medium"
                      style={{ color: 'var(--tx-2)' }}>
                      <FaTachometerAlt size={13} className="text-brand-500"/> Backoffice
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors font-medium">
                    <FaSignOutAlt size={13}/> Cerrar sesión
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm transition-colors">
                  Iniciar Sesión
                </Link>
              )}
              <div className="flex gap-2">
                <button onClick={toggle} className="p-2.5 rounded-xl hover:bg-brand-500/10" style={{ color: 'var(--tx-2)' }}>{theme === 'dark' ? <IoSunnyOutline size={18}/> : <IoMoonOutline size={18}/>}</button>
                <a href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors"><FaWhatsapp size={15}/> WhatsApp</a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

// Helper para usar fuera del store
function isCliente(user) { return user?.rol === 'CLIENTE' }
