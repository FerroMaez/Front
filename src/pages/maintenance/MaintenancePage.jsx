import { FaWhatsapp, FaTools, FaCalendarAlt, FaShieldAlt, FaRecycle } from 'react-icons/fa'
import { companyInfo } from '../../features/catalog/catalogData'
import Carrusel, { FotoCompleta } from '../../features/mantenimiento/Carrusel'

// Fotos de "Antes y después": cada par es la misma válvula o equipo antes y después del
// mantenimiento. La sección se oculta mientras la lista esté vacía.
// Ejemplo: { antes: '/mantenimiento/antes-despues/1-antes.jpg', despues: '/mantenimiento/antes-despues/1-despues.jpg', titulo: 'Válvula reguladora de presión' }
const ANTES_DESPUES = []

const TRABAJOS_TERMINADOS = [
  { src: '/mantenimiento/trabajos/1.jpg', titulo: 'Sistema de bombeo con tanque hidroneumático' },
  { src: '/mantenimiento/trabajos/2.jpg', titulo: 'Tuberías de succión en acero inoxidable con válvulas de pie' },
  { src: '/mantenimiento/trabajos/3.jpg', titulo: 'Montaje de equipo de bombeo con válvulas de compuerta y cheque' },
  { src: '/mantenimiento/trabajos/4.jpg', titulo: 'Línea de descarga con válvula de compuerta y manómetro' },
  { src: '/mantenimiento/trabajos/5.jpg', titulo: 'Sistema de presión con tres bombas y tanque hidroacumulador' },
  { src: '/mantenimiento/trabajos/6.jpg', titulo: 'Manifold en acero inoxidable con válvulas de compuerta y cheque' },
]

const SERVICIOS = [
  { icon: <FaTools size={18} />,       title: 'Preventivo', desc: 'Inspección, ajuste y calibración periódica de componentes hidráulicos.' },
  { icon: <FaShieldAlt size={18} />,   title: 'Correctivo', desc: 'Diagnóstico y reparación de fallas para restablecer el funcionamiento.' },
  { icon: <FaCalendarAlt size={18} />, title: 'Programado', desc: 'Planes anuales con visitas periódicas y seguimiento de historial.' },
]

function AntesDespues({ par }) {
  return (
    <div className="absolute inset-0 grid grid-cols-2 gap-px bg-black/40">
      {[['Antes', par.antes], ['Después', par.despues]].map(([etiqueta, src]) => (
        <div key={etiqueta} className="relative overflow-hidden">
          <FotoCompleta src={src} alt={`${par.titulo || 'Mantenimiento'}: ${etiqueta.toLowerCase()}`} />
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white ${etiqueta === 'Antes' ? 'bg-black/60' : 'bg-green-600'}`}>
            {etiqueta}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function MaintenancePage() {
  const waMessage = encodeURIComponent('Hola MANHID, me interesa información sobre sus servicios de mantenimiento hidráulico.')
  const waLink = `https://wa.me/${companyInfo.whatsapp.replace(/\D/g, '')}?text=${waMessage}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative overflow-hidden rounded-[2rem] p-8 sm:p-10 mb-10"
        style={{ border: '1px solid var(--bd-1)', backgroundColor: 'var(--bg-raised)' }}>
        <div className="absolute inset-0 mesh-flow opacity-[0.16] dark:opacity-25 pointer-events-none" />
        <div className="blob w-72 h-72 -top-16 -right-10 bg-aqua-500 opacity-30 animate-flow-alt" />
        <div className="relative">
          <div className="section-badge mb-4">Servicio especializado</div>
          <h1 className="section-title">Manteni<span className="gradient-text">mientos</span></h1>
          <p className="section-subtitle max-w-lg">Mantenimiento, reparación y remanufacturación de válvulas para sistemas hidráulicos industriales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-16">
        {/* Descripción del proceso */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--tx-1)' }}>Nuestro proceso</h2>
          <div className="space-y-4 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--tx-2)' }}>
            <p>
              En Mantenimientos Hidráulicos KM S.A.S. realizamos procesos de mantenimiento, reparación y remanufacturación
              de válvulas utilizadas en sistemas hidráulicos industriales. El proceso comienza con una inspección y
              diagnóstico para identificar el estado de la válvula y determinar las piezas que necesitan reparación o reemplazo.
            </p>
            <p>
              Posteriormente, se realiza el desmonte, limpieza, revisión de sus componentes, recuperación de las piezas que
              todavía pueden funcionar y sustitución de aquellas que presentan daños o desgaste. Finalmente, se lleva a cabo
              el ensamblaje y las pruebas de funcionamiento para verificar que la válvula opere correctamente.
            </p>
          </div>
          <div className="mt-6 flex gap-4 p-5 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(21,128,61,0.12), rgba(21,128,61,0.05))', border: '1px solid rgba(34,197,94,0.25)' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
              <FaRecycle size={18} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--tx-2)' }}>
              Este proceso contribuye a la <strong style={{ color: 'var(--tx-1)' }}>sostenibilidad</strong>, ya que permite
              aprovechar nuevamente los materiales, reducir la generación de residuos industriales, disminuir la necesidad de
              fabricar o comprar válvulas nuevas y extender la vida útil de los equipos, promoviendo así un uso más eficiente
              de los recursos.
            </p>
          </div>
        </div>

        {/* Lateral */}
        <div className="lg:col-span-2 space-y-5">
          {SERVICIOS.map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 rounded-2xl transition-all hover:-translate-y-0.5" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-aqua-600 dark:text-aqua-300 flex-shrink-0" style={{ backgroundColor: 'rgba(6,182,212,0.14)' }}>
                {icon}
              </div>
              <div>
                <h4 className="font-semibold text-sm" style={{ color: 'var(--tx-1)' }}>{title}</h4>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--tx-2)' }}>{desc}</p>
              </div>
            </div>
          ))}

          <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(21,128,61,0.12), rgba(21,128,61,0.06))', border: '1px solid rgba(34,197,94,0.2)' }}>
            <p className="font-semibold mb-1" style={{ color: 'var(--tx-1)' }}>¿Necesitas un mantenimiento?</p>
            <p className="text-xs mb-4 text-green-700 dark:text-green-400">Escríbenos por WhatsApp y te respondemos de inmediato</p>
            <a href={waLink} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-full transition-all hover:-translate-y-0.5">
              <FaWhatsapp size={15} /> Chatear ahora
            </a>
          </div>
        </div>
      </div>

      {ANTES_DESPUES.length > 0 && (
        <section className="mb-16">
          <div className="section-badge mb-3">Resultados</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--tx-1)' }}>Antes y después</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--tx-2)' }}>Así recibimos los equipos y así los entregamos.</p>
          <Carrusel items={ANTES_DESPUES} render={(par) => <AntesDespues par={par} />} />
        </section>
      )}

      <section>
        <div className="section-badge mb-3">Galería</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--tx-1)' }}>Trabajos terminados</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--tx-2)' }}>Algunas de las instalaciones y mantenimientos que hemos entregado.</p>
        <div className="max-w-4xl">
          <Carrusel items={TRABAJOS_TERMINADOS} miniaturas alto="h-[420px] sm:h-[560px]" />
        </div>
      </section>
    </div>
  )
}
