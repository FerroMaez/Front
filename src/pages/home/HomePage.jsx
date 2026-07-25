import { Link } from 'react-router-dom'
import { FaArrowRight, FaTools, FaShieldAlt, FaClock, FaWhatsapp, FaPhoneAlt, FaCheckCircle, FaTint } from 'react-icons/fa'
import { HiLocationMarker } from 'react-icons/hi'
import { catalogProducts, companyInfo } from '../../features/catalog/catalogData'
import ProductCard from '../../components/shared/ProductCard'

const stats = [
  { value: '15+',  label: 'Años de experiencia',    grad: 'from-brand-500 to-brand-600' },
  { value: '500+', label: 'Proyectos completados',  grad: 'from-aqua-500 to-aqua-600' },
  { value: '100%', label: 'Clientes satisfechos',   grad: 'from-brand-400 to-aqua-500' },
  { value: '5',    label: 'Líneas de producto',     grad: 'from-aqua-400 to-brand-500' },
]

const features = [
  {
    icon: <FaTools size={19} />,
    bg: 'rgba(140,144,59,0.14)',
    accent: 'text-brand-600 dark:text-brand-300',
    title: 'Mantenimiento Especializado',
    desc: 'Servicio preventivo y correctivo para sistemas hidráulicos industriales y residenciales.',
  },
  {
    icon: <FaShieldAlt size={19} />,
    bg: 'rgba(6,182,212,0.14)',
    accent: 'text-aqua-600 dark:text-aqua-300',
    title: 'Productos Certificados',
    desc: 'Todos nuestros productos cumplen normas de calidad y seguridad internacionales.',
  },
  {
    icon: <FaClock size={19} />,
    bg: 'rgba(8,145,178,0.14)',
    accent: 'text-aqua-700 dark:text-aqua-400',
    title: 'Respuesta Rápida',
    desc: 'Atendemos emergencias y garantizamos tiempos de respuesta inmediatos.',
  },
]

export default function HomePage() {
  const waHref = `https://wa.me/${companyInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, quiero información sobre sus servicios hidráulicos.')}`

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO — split asimétrico + flujo de agua
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
        {/* Atmósfera: malla de degradado + blobs animados */}
        <div className="absolute inset-0 mesh-flow opacity-[0.22] dark:opacity-30 pointer-events-none" />
        <div className="blob w-[460px] h-[460px] -top-28 -left-24 bg-brand-400 animate-flow" />
        <div className="blob w-[520px] h-[520px] top-10 -right-28 bg-aqua-500 animate-flow-alt" />
        <div className="absolute inset-0 dot-grid opacity-[0.5] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 lg:pt-24 lg:pb-36">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">

            {/* Columna texto */}
            <div className="max-w-xl">
              <div className="section-badge mb-6 animate-fadein">
                <span className="w-1.5 h-1.5 rounded-full bg-aqua-500 animate-pulse" />
                Especialistas · Bogotá, Colombia
              </div>

              <h1 className="font-display text-[2.75rem] sm:text-6xl lg:text-[4.6rem] font-extrabold leading-[1.02] tracking-[-0.03em] mb-6 animate-fadein-delay"
                style={{ color: 'var(--tx-1)' }}>
                TODO PARA {' '}
                <span className="gradient-text">REDES HIDRÁULICAS EN UN SOLO LUGAR</span>
              </h1>

              <ul className="flex flex-wrap gap-2.5 mb-8 animate-fadein-slow">
                {['Suministro', 'Mantenimiento', 'Respaldo técnico'].map((item) => (
                  <li key={item}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>
                    <FaCheckCircle size={14} className="text-aqua-500" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3.5 mb-8 animate-fadein-slow">
                <Link to="/catalogo" className="btn-primary px-7 py-3.5">
                  Ver Catálogo <FaArrowRight size={13} />
                </Link>
                <a href={waHref} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm bg-green-600 hover:bg-green-500 text-white transition-all shadow-lg shadow-green-900/25 hover:-translate-y-0.5">
                  <FaWhatsapp size={16} /> Consultar ahora
                </a>
              </div>

              <div className="flex items-center gap-2 text-sm animate-fadein-slow" style={{ color: 'var(--tx-3)' }}>
                <HiLocationMarker size={16} className="text-aqua-500" />
                <span>{companyInfo.address}, {companyInfo.city}</span>
              </div>
            </div>

            {/* Columna imagen — tarjeta fluida flotante */}
            <div className="relative animate-fadein-slow">
              {/* Halo detrás */}
              <div className="absolute -inset-6 rounded-[3rem] mesh-flow opacity-60 blur-2xl pointer-events-none" />

              <div className="relative">
                <div className="relative overflow-hidden shadow-float animate-float-y"
                  style={{ borderRadius: '2rem', border: '1px solid var(--bd-1)' }}>
                  <img src="/sector1.png" alt="Sistemas hidráulicos MANHID"
                    className="w-full aspect-[4/3] object-cover" />
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(150deg, transparent 45%, rgba(8,20,30,0.55))' }} />
                </div>

                {/* Pill flotante superior */}
                <div className="glass absolute -top-4 -left-4 px-4 py-3 flex items-center gap-3 shadow-raised">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-aqua-400 to-aqua-600">
                    <FaTint size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-none" style={{ color: 'var(--tx-1)' }}>15+ años</p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--tx-3)' }}>en el sector</p>
                  </div>
                </div>

                {/* Pill flotante teléfono */}
                <div className="glass absolute -bottom-5 -right-4 px-4 py-3 flex items-center gap-3 shadow-raised">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-500/15">
                    <FaPhoneAlt size={14} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-none" style={{ color: 'var(--tx-1)' }}>{companyInfo.phone2}</p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--tx-3)' }}>Atención directa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divisor de ola hacia la banda de stats */}
        <div className="relative -mb-px">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="w-full h-[52px] sm:h-[80px]" style={{ display: 'block' }}>
            <path d="M0,64 C240,16 480,16 720,48 C960,80 1200,80 1440,32 L1440,90 L0,90 Z" fill="var(--bg-raised)" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS — banda de tarjetas flotantes
      ══════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--bg-raised)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-4 sm:-mt-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ value, label, grad }) => (
              <div key={label} className="reveal relative rounded-3xl p-6 overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--bd-1)' }}>
                <span className={`block h-1.5 w-10 rounded-full mb-4 bg-gradient-to-r ${grad}`} />
                <p className={`text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-br ${grad} bg-clip-text text-transparent`}>
                  {value}
                </p>
                <p className="text-sm mt-1.5 font-medium" style={{ color: 'var(--tx-2)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LÍNEAS DE PRODUCTO
      ══════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 reveal">
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
            {catalogProducts.map((p) => (
              <div key={p.id} className="reveal"><ProductCard product={p} /></div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          POR QUÉ ELEGIRNOS — texto izq / imagen der
      ══════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden" style={{ backgroundColor: 'var(--bg-raised)' }}>
        <div className="blob w-[420px] h-[420px] top-10 -left-32 bg-aqua-400 opacity-30 animate-flow" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">

            {/* Texto */}
            <div className="reveal">
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
                {features.map(({ icon, bg, accent, title, desc }) => (
                  <div key={title}
                    className="flex gap-4 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: bg, border: '1px solid var(--bd-1)' }}>
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/60 dark:bg-white/10 ${accent}`}>
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-0.5" style={{ color: 'var(--tx-1)' }}>{title}</h4>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--tx-2)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/quienes-somos" className="btn-outline">
                Conocer más sobre nosotros <FaArrowRight size={12} />
              </Link>
            </div>

            {/* Imagen con overlap */}
            <div className="relative reveal">
              <div className="relative overflow-hidden shadow-float"
                style={{ borderRadius: '2rem', border: '1px solid var(--bd-1)' }}>
                <img src="/interior1.jpeg" alt="Nuestras instalaciones"
                  className="w-full aspect-[4/3] object-cover" />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top right, rgba(8,20,30,0.4), transparent)' }} />
              </div>

              {/* Badge flotante experiencia */}
              <div className="glass absolute -top-5 -right-5 p-4 text-center">
                <p className="text-3xl font-extrabold gradient-text leading-none">15+</p>
                <p className="text-xs mt-1 font-medium" style={{ color: 'var(--tx-3)' }}>Años de<br />experiencia</p>
              </div>

              {/* Card teléfono */}
              <div className="glass absolute -bottom-5 -left-5 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-green-500/15">
                  <FaPhoneAlt size={15} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--tx-1)' }}>{companyInfo.phone2}</p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--tx-3)' }}>Atención directa</p>
                </div>
              </div>
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

            {/* Columna izquierda: checklist + whatsapp */}
            <div className="lg:col-span-2 flex flex-col gap-5 order-2 lg:order-1">
              <div className="reveal rounded-3xl p-6 flex-1"
                style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
                <h4 className="font-bold text-base mb-4" style={{ color: 'var(--tx-1)' }}>
                  Incluye en cada servicio
                </h4>
                <ul className="space-y-3">
                  {['Inspección visual completa','Ajuste y calibración de presiones','Reemplazo de sellos y empaques','Informe técnico detallado','Garantía del servicio'].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--tx-2)' }}>
                      <FaCheckCircle size={14} className="text-aqua-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="reveal rounded-3xl p-6" style={{
                background: 'linear-gradient(135deg, rgba(21,128,61,0.15), rgba(21,128,61,0.08))',
                border: '1px solid rgba(34,197,94,0.25)',
              }}>
                <p className="font-bold text-base mb-1" style={{ color: 'var(--tx-1)' }}>¿Necesitas un servicio?</p>
                <p className="text-xs mb-4 text-green-700 dark:text-green-400">Respuesta inmediata vía WhatsApp</p>
                <a href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent('Hola MANHID, necesito un servicio de mantenimiento hidráulico.')}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-full transition-all hover:-translate-y-0.5 shadow-md shadow-green-900/25">
                  <FaWhatsapp size={16} /> Contactar ahora
                </a>
              </div>
            </div>

            {/* Tarjeta grande con imagen */}
            <div className="reveal lg:col-span-3 relative rounded-3xl overflow-hidden min-h-[380px] group order-1 lg:order-2"
              style={{ border: '1px solid var(--bd-1)' }}>
              <img src="/mantenimiento/1.png" alt="Mantenimiento hidráulico"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 absolute inset-0"
                onError={(e) => { e.target.src = '/sector.jpeg' }} />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(8,20,30,0.92) 28%, rgba(8,20,30,0.35) 70%, transparent)' }} />
              <div className="relative p-8 h-full flex flex-col justify-end">
                <div className="section-badge w-fit mb-3">Servicio técnico</div>
                <h3 className="text-2xl font-bold text-white mb-2">Mantenimiento Preventivo</h3>
                <p className="text-white/70 text-sm mb-5 max-w-xs">
                  Mantenimiento a válvulas reguladoras de presión y sistemas hidráulicos completos.
                </p>
                <Link to="/mantenimientos" className="btn-primary w-fit">
                  Ver servicios <FaArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FINAL — flujo de agua
      ══════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg-raised)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal relative rounded-[2.5rem] overflow-hidden p-10 lg:p-16 text-center">
            <div className="absolute inset-0 mesh-flow opacity-90" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,20,30,0.35), rgba(8,20,30,0.15))' }} />
            <div className="absolute inset-0 dot-grid opacity-20" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 bg-white/85 dark:bg-white/10 text-brand-700 dark:text-aqua-200 backdrop-blur">
                Empieza hoy
              </div>
              <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow">
                ¿Listo para trabajar juntos?
              </h2>
              <p className="text-base lg:text-lg mb-10 max-w-md mx-auto leading-relaxed text-white/90">
                Contáctanos y recibe asesoría personalizada para tus sistemas hidráulicos sin costo.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href={waHref} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2.5 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full text-sm transition-all shadow-lg shadow-green-900/30 hover:-translate-y-0.5">
                  <FaWhatsapp size={18} /> Chatear por WhatsApp
                </a>
                <Link to="/contacto"
                  className="flex items-center gap-2 px-8 py-4 font-semibold rounded-full text-sm transition-all hover:-translate-y-0.5 bg-white text-slate-900 hover:bg-white/90">
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
