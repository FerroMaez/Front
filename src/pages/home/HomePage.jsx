import { Link } from 'react-router-dom'
import { FaArrowRight, FaTools, FaShieldAlt, FaClock, FaWhatsapp, FaPhoneAlt, FaCheckCircle } from 'react-icons/fa'
import { HiLocationMarker } from 'react-icons/hi'
import { catalogProducts, companyInfo } from '../../features/catalog/catalogData'
import ProductCard from '../../components/shared/ProductCard'

const stats = [
  { value: '15+', label: 'Años de experiencia' },
  { value: '500+', label: 'Proyectos completados' },
  { value: '100%', label: 'Clientes satisfechos' },
  { value: '5',   label: 'Líneas de producto' },
]

const features = [
  {
    icon: <FaTools size={19} />,
    bg: 'rgba(140,144,59,0.12)',
    title: 'Mantenimiento Especializado',
    desc: 'Servicio preventivo y correctivo para sistemas hidráulicos industriales y residenciales.',
  },
  {
    icon: <FaShieldAlt size={19} />,
    bg: 'rgba(34,197,94,0.12)',
    title: 'Productos Certificados',
    desc: 'Todos nuestros productos cumplen normas de calidad y seguridad internacionales.',
  },
  {
    icon: <FaClock size={19} />,
    bg: 'rgba(99,102,241,0.12)',
    title: 'Respuesta Rápida',
    desc: 'Atendemos emergencias y garantizamos tiempos de respuesta inmediatos.',
  },
]

export default function HomePage() {
  const waHref = `https://wa.me/${companyInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, quiero información sobre sus servicios hidráulicos.')}`

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Imagen de fondo — visible y con color */}
        <div className="absolute inset-0">
          <img
            src="/sector.jpeg"
            alt="Sistemas hidráulicos"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 30%' }}
          />
          {/* Capa de color brand sobre la foto */}
          <div className="absolute inset-0"
            style={{ background: 'rgba(29,30,12,0.50)' }} />
          {/* Gradiente izquierda para texto legible */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(100deg, rgba(29,30,12,0.92) 40%, rgba(29,30,12,0.55) 70%, transparent 100%)' }} />
          {/* Gradiente abajo para transición al body */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, var(--bg-base) 0%, transparent 30%)' }} />
        </div>

        {/* Patrón de puntos */}
        <div className="absolute inset-0 dot-grid opacity-25 pointer-events-none" />

        {/* Glow orb brand */}
        <div className="absolute top-1/3 left-1/2 w-[480px] h-[480px] rounded-full pointer-events-none animate-glow"
          style={{ background: 'radial-gradient(circle, rgba(140,144,59,0.18) 0%, transparent 70%)', transform: 'translate(-30%,-50%)' }} />

        {/* Contenido */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-[620px]">

            <div className="section-badge mb-7 animate-fadein">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              <span>Especialistas · Bogotá, Colombia</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[66px] font-bold text-white leading-[1.06] tracking-tight mb-6 animate-fadein-delay">
              Sistemas{' '}
              <span className="relative inline-block">
                <span className="gradient-text">hidráulicos</span>
                {/* Subrayado curvo */}
                <svg className="absolute -bottom-1 left-0 w-full" height="5" viewBox="0 0 200 5" fill="none" preserveAspectRatio="none">
                  <path d="M0 3 Q50 1 100 3 Q150 5 200 3" stroke="url(#ug)" strokeWidth="2.5" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="ug" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor="#8C903B" stopOpacity="0"/>
                      <stop offset="45%"  stopColor="#8C903B"/>
                      <stop offset="100%" stopColor="#8C903B" stopOpacity="0.3"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              {' '}de confianza
            </h1>

            <p className="text-white/75 text-lg leading-relaxed mb-9 max-w-[500px] animate-fadein-slow">
              Suministro y mantenimiento especializado para redes hidráulicas,
              contra incendios, acueducto, acero inoxidable y PVC en Bogotá.
            </p>

            <div className="flex flex-wrap gap-4 mb-10 animate-fadein-slow">
              <Link to="/catalogo" className="btn-primary text-sm px-7 py-3.5">
                Ver Catálogo <FaArrowRight size={13} />
              </Link>
              <a href={waHref} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm bg-green-600/90 hover:bg-green-500 text-white transition-all shadow-lg shadow-green-900/30 hover:-translate-y-px">
                <FaWhatsapp size={16} /> Consultar ahora
              </a>
            </div>

            <div className="flex items-center gap-2 text-white/50 text-sm animate-fadein-slow">
              <HiLocationMarker size={16} className="text-brand-400" />
              <span>{companyInfo.address}, {companyInfo.city}</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30 pointer-events-none">
          <span className="text-[10px] text-white uppercase tracking-widest">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS
      ══════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--bg-raised)', borderTop: '1px solid var(--bd-1)', borderBottom: '1px solid var(--bd-1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl lg:text-5xl font-bold tracking-tight mb-1 gradient-text">{value}</p>
                <p className="text-sm font-medium" style={{ color: 'var(--tx-3)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICIOS
      ══════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="section-badge mb-4">Lo que ofrecemos</div>
              <h2 className="section-title">
                Nuestras líneas de <span className="gradient-text">producto</span>
              </h2>
              <p className="section-subtitle max-w-lg">
                Portafolio completo para sistemas hidráulicos residenciales, comerciales e industriales.
              </p>
            </div>
            <Link to="/catalogo" className="btn-outline flex-shrink-0">
              Ver catálogo completo <FaArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {catalogProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          POR QUÉ ELEGIRNOS
      ══════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg-raised)', borderTop: '1px solid var(--bd-1)', borderBottom: '1px solid var(--bd-1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Imagen */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden"
                style={{ border: '1px solid var(--bd-1)', boxShadow: '0 20px 60px -15px rgba(140,144,59,0.15)' }}>
                <img src="/interior.jpeg" alt="Nuestras instalaciones"
                  className="w-full aspect-[4/3] object-cover" />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top right, rgba(29,30,12,0.4), transparent)' }} />
              </div>

              {/* Badge flotante */}
              <div className="absolute -top-5 -right-5 glass p-4 shadow-xl">
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-300">15<span className="text-brand-500">+</span></p>
                <p className="text-xs font-medium" style={{ color: 'var(--tx-3)' }}>Años de<br />experiencia</p>
              </div>

              {/* Card teléfono */}
              <div className="absolute -bottom-5 -left-5 glass p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/15">
                  <FaPhoneAlt size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--tx-1)' }}>{companyInfo.phone1}</p>
                  <p className="text-xs" style={{ color: 'var(--tx-3)' }}>{companyInfo.phone2}</p>
                </div>
              </div>
            </div>

            {/* Texto */}
            <div className="order-1 lg:order-2">
              <div className="section-badge mb-5">¿Por qué elegirnos?</div>
              <h2 className="section-title mb-5">
                Expertos que cuidan <span className="gradient-text">tu inversión</span>
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--tx-2)' }}>
                En MANHID combinamos más de 15 años de experiencia con un equipo técnico
                especializado y productos de calidad certificada para garantizar el óptimo
                funcionamiento de tus sistemas hidráulicos.
              </p>

              <div className="space-y-3 mb-8">
                {features.map(({ icon, bg, title, desc }) => (
                  <div key={title}
                    className="flex gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: bg, border: '1px solid var(--bd-1)' }}>
                    <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center text-brand-600 dark:text-brand-300 flex-shrink-0">
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--tx-1)' }}>{title}</h4>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--tx-2)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/quienes-somos" className="btn-outline">
                Conocer más sobre nosotros
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MANTENIMIENTOS — bento
      ══════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Tarjeta grande con imagen */}
            <div className="lg:col-span-3 relative rounded-3xl overflow-hidden min-h-[360px] group"
              style={{ border: '1px solid var(--bd-1)' }}>
              <img src="/mantenimiento/1.png" alt="Mantenimiento hidráulico"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 absolute inset-0"
                onError={(e) => { e.target.src = '/sector.jpeg' }} />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(29,30,12,0.92) 30%, rgba(29,30,12,0.4) 70%, transparent)' }} />
              <div className="relative p-8 h-full flex flex-col justify-end">
                <div className="section-badge w-fit mb-3">Servicio técnico</div>
                <h3 className="text-2xl font-bold text-white mb-2">Mantenimiento Preventivo</h3>
                <p className="text-white/65 text-sm mb-5 max-w-xs">
                  Mantenimiento a válvulas reguladoras de presión y sistemas hidráulicos completos.
                </p>
                <Link to="/mantenimientos" className="btn-primary w-fit text-sm">
                  Ver servicios <FaArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Checklist */}
              <div className="rounded-2xl p-6 flex-1"
                style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
                <h4 className="font-semibold text-base mb-4" style={{ color: 'var(--tx-1)' }}>
                  Incluye en cada servicio
                </h4>
                <ul className="space-y-3">
                  {['Inspección visual completa','Ajuste y calibración de presiones','Reemplazo de sellos y empaques','Informe técnico detallado','Garantía del servicio'].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--tx-2)' }}>
                      <FaCheckCircle size={13} className="text-brand-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* WhatsApp card */}
              <div className="rounded-3xl p-6" style={{
                background: 'linear-gradient(135deg, rgba(21,128,61,0.15), rgba(21,128,61,0.08))',
                border: '1px solid rgba(34,197,94,0.2)',
              }}>
                <p className="font-semibold text-base mb-1" style={{ color: 'var(--tx-1)' }}>¿Necesitas un servicio?</p>
                <p className="text-xs mb-4 text-green-700 dark:text-green-400">Respuesta inmediata vía WhatsApp</p>
                <a href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent('Hola MANHID, necesito un servicio de mantenimiento hidráulico.')}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-xl transition-all hover:-translate-y-px shadow-md shadow-green-900/30">
                  <FaWhatsapp size={16} /> Contactar ahora
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg-raised)', borderTop: '1px solid var(--bd-1)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative rounded-3xl overflow-hidden p-10 lg:p-16">
            {/* Fondo con gradiente brand */}
            <div className="absolute inset-0 rounded-3xl"
              style={{ background: 'linear-gradient(135deg, rgba(140,144,59,0.15), rgba(140,144,59,0.05) 50%, rgba(140,144,59,0.12))' }} />
            <div className="absolute inset-0 rounded-3xl"
              style={{ border: '1px solid rgba(140,144,59,0.25)', boxShadow: '0 0 60px -20px rgba(140,144,59,0.25)' }} />
            <div className="absolute inset-0 dot-grid opacity-30 rounded-3xl" />

            <div className="relative">
              <div className="section-badge mx-auto w-fit mb-6">Empieza hoy</div>
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--tx-1)' }}>
                ¿Listo para trabajar<br />
                <span className="gradient-text">juntos?</span>
              </h2>
              <p className="text-base lg:text-lg mb-10 max-w-md mx-auto leading-relaxed" style={{ color: 'var(--tx-2)' }}>
                Contáctanos y recibe asesoría personalizada para tus sistemas hidráulicos sin costo.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href={waHref} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-green-900/30 hover:-translate-y-px">
                  <FaWhatsapp size={18} /> Chatear por WhatsApp
                </a>
                <Link to="/contacto"
                  className="flex items-center gap-2 px-8 py-4 font-semibold rounded-xl text-sm transition-all hover:-translate-y-px"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>
                  Ver más información <FaArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
