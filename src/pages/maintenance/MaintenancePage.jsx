import { FaWhatsapp, FaCheckCircle, FaTools, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { companyInfo } from '../../features/catalog/catalogData'

const services = [
  {
    icon: <FaTools size={20} />,
    title: 'Mantenimiento Preventivo',
    desc: 'Inspección, limpieza y ajuste periódico de válvulas reguladoras de presión, filtros y componentes hidráulicos.',
    items: ['Inspección visual completa', 'Limpieza interna de componentes', 'Ajuste de presiones', 'Reemplazo de sellos y empaques'],
  },
  {
    icon: <FaShieldAlt size={20} />,
    title: 'Mantenimiento Correctivo',
    desc: 'Diagnóstico y reparación de fallas en sistemas hidráulicos para restablecer el funcionamiento óptimo.',
    items: ['Diagnóstico de fallas', 'Reparación o reemplazo de componentes', 'Pruebas de presión', 'Informe técnico del servicio'],
  },
  {
    icon: <FaCalendarAlt size={20} />,
    title: 'Programa de Mantenimiento',
    desc: 'Planes periódicos para garantizar la operación continua y reducir costos de reparación a largo plazo.',
    items: ['Visitas programadas', 'Historial de mantenimiento', 'Inventario de repuestos', 'Soporte técnico prioritario'],
  },
]

export default function MaintenancePage() {
  const waMessage = encodeURIComponent('Hola MANHID, me interesa información sobre sus servicios de mantenimiento hidráulico.')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="mb-12">
        <div className="section-badge mb-4">Servicio especializado</div>
        <h1 className="section-title">Mantenimientos</h1>
        <p className="section-subtitle">Servicio preventivo y correctivo para tus sistemas hidráulicos</p>
      </div>

      {/* Hero imagen */}
      <div className="relative rounded-2xl overflow-hidden mb-14 group"
        style={{ border: '1px solid var(--bd-1)' }}>
        <img
          src="/mantenimiento/1.png"
          alt="Mantenimiento hidráulico"
          className="w-full h-72 md:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => { e.target.src = '/sector.jpeg' }}
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(29,30,12,0.88) 40%, rgba(29,30,12,0.3) 80%, transparent)' }} />
        <div className="absolute inset-0 flex items-center p-8 lg:p-16">
          <div className="max-w-lg">
            <div className="section-badge mb-4">Servicio destacado</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Mantenimiento a Válvula Reguladora de Presión
            </h2>
            <p className="text-white/65 text-sm lg:text-base leading-relaxed mb-6">
              Conserva la eficiencia y vida útil de tu sistema hidráulico con nuestros servicios especializados.
            </p>
            <a
              href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g,'')}?text=${waMessage}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all hover:-translate-y-px shadow-md shadow-green-900/30 text-sm"
            >
              <FaWhatsapp size={16} /> Solicitar servicio
            </a>
          </div>
        </div>
      </div>

      {/* Cards de servicio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
        {services.map(({ icon, title, desc, items }) => (
          <div key={title} className="flex flex-col gap-5 p-6 rounded-2xl transition-all hover:-translate-y-1"
            style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)', boxShadow: '0 2px 12px -4px rgba(140,144,59,0.06)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-300"
              style={{ backgroundColor: 'rgba(140,144,59,0.12)' }}>
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--tx-1)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--tx-2)' }}>{desc}</p>
            </div>
            <ul className="space-y-2 mt-auto pt-4" style={{ borderTop: '1px solid var(--bd-1)' }}>
              {items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--tx-2)' }}>
                  <FaCheckCircle className="text-brand-500 mt-0.5 flex-shrink-0" size={13} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="p-8 lg:p-12 rounded-2xl text-center"
        style={{ background: 'linear-gradient(135deg, rgba(140,144,59,0.12), rgba(140,144,59,0.05))', border: '1px solid rgba(140,144,59,0.22)' }}>
        <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--tx-1)' }}>
          ¿Necesitas un mantenimiento?
        </h3>
        <p className="text-base mb-6 max-w-lg mx-auto" style={{ color: 'var(--tx-2)' }}>
          Contáctanos y nuestro equipo técnico te asesorará sobre el mejor plan para tu sistema.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g,'')}?text=${waMessage}`}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-7 py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all hover:-translate-y-px shadow-md shadow-green-900/20"
          >
            <FaWhatsapp size={17} /> WhatsApp
          </a>
          <Link to="/contacto" className="btn-outline px-7 py-3.5">Ver contacto</Link>
        </div>
      </div>
    </div>
  )
}
