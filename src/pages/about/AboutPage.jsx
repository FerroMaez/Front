import { useState } from 'react'
import { FaCheckCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const slides = ['/sector.jpeg', '/interior.jpeg']

const values = [
  'Más de 15 años de experiencia en el sector hidráulico',
  'Portafolio completo de productos de calidad certificada',
  'Mantenimiento preventivo y correctivo especializado',
  'Equipo técnico altamente capacitado',
  'Atención personalizada y asesoría técnica',
  'Cobertura en toda Bogotá y alrededores',
]

const numbers = [
  { v: '15+', l: 'Años' },
  { v: '500+', l: 'Proyectos' },
  { v: '5', l: 'Líneas de producto' },
]

export default function AboutPage() {
  const [slide, setSlide] = useState(0)
  const prev = () => setSlide((s) => (s - 1 + slides.length) % slides.length)
  const next = () => setSlide((s) => (s + 1) % slides.length)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="mb-12">
        <div className="section-badge mb-4">Nuestra historia</div>
        <h1 className="section-title">Quiénes Somos</h1>
        <p className="section-subtitle">Expertos en sistemas hidráulicos desde hace más de 15 años</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start mb-16">

        {/* Texto */}
        <div>
          <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--tx-2)' }}>
            <span className="font-semibold" style={{ color: 'var(--tx-1)' }}>MANHID</span>{' '}
            es una empresa bogotana con más de{' '}
            <span className="text-brand-600 dark:text-brand-300 font-semibold">15 años de experiencia</span>{' '}
            en el sector de sistemas hidráulicos. Nos especializamos en el suministro y
            mantenimiento de soluciones hidráulicas para el sector residencial, comercial e industrial.
          </p>
          <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--tx-2)' }}>
            Contamos con un portafolio completo de productos — desde válvulas y tuberías hasta
            sistemas contra incendios y acueducto — respaldados por marcas líderes en el mercado.
            Nuestro equipo técnico garantiza instalaciones y mantenimientos de la más alta calidad.
          </p>

          <h3 className="font-semibold text-lg mb-5" style={{ color: 'var(--tx-1)' }}>
            ¿Por qué elegirnos?
          </h3>
          <ul className="space-y-3 mb-8">
            {values.map((v) => (
              <li key={v} className="flex items-start gap-3 text-sm" style={{ color: 'var(--tx-2)' }}>
                <FaCheckCircle className="text-brand-500 flex-shrink-0 mt-0.5" size={15} />
                {v}
              </li>
            ))}
          </ul>

          <div className="flex gap-4">
            <Link to="/contacto" className="btn-primary">Contáctanos</Link>
            <Link to="/catalogo" className="btn-outline">Ver catálogo</Link>
          </div>
        </div>

        {/* Carrusel */}
        <div>
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]"
            style={{ border: '1px solid var(--bd-1)' }}>
            <img
              key={slide}
              src={slides[slide]}
              alt={`MANHID - imagen ${slide + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(29,30,12,0.35), transparent)' }} />

            <button onClick={prev} aria-label="Anterior"
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl text-white transition-all hover:scale-110"
              style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
              <FaArrowLeft size={13} />
            </button>
            <button onClick={next} aria-label="Siguiente"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl text-white transition-all hover:scale-110"
              style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
              <FaArrowRight size={13} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slides.map((src, i) => (
                <button key={src} onClick={() => setSlide(i)} aria-label={`Imagen ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
              ))}
            </div>
          </div>

          {/* Stats card */}
          <div className="mt-4 p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
            <div className="grid grid-cols-3 gap-4 text-center">
              {numbers.map(({ v, l }) => (
                <div key={l}>
                  <p className="text-2xl font-bold gradient-text">{v}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--tx-3)' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
