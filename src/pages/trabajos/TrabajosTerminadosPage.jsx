import { FaWhatsapp } from 'react-icons/fa'
import { companyInfo } from '../../features/catalog/catalogData'
import Carrusel from '../../features/mantenimiento/Carrusel'

const TRABAJOS_TERMINADOS = [
  { src: '/mantenimiento/trabajos/1.jpg', titulo: 'Sistema de bombeo con tanque hidroneumático' },
  { src: '/mantenimiento/trabajos/2.jpg', titulo: 'Tuberías de succión en acero inoxidable con válvulas de pie' },
  { src: '/mantenimiento/trabajos/3.jpg', titulo: 'Montaje de equipo de bombeo con válvulas de compuerta y cheque' },
  { src: '/mantenimiento/trabajos/4.jpg', titulo: 'Línea de descarga con válvula de compuerta y manómetro' },
  { src: '/mantenimiento/trabajos/5.jpg', titulo: 'Sistema de presión con tres bombas y tanque hidroacumulador' },
  { src: '/mantenimiento/trabajos/6.jpg', titulo: 'Manifold en acero inoxidable con válvulas de compuerta y cheque' },
]

export default function TrabajosTerminadosPage() {
  const waMessage = encodeURIComponent('Hola MANHID, vi sus trabajos terminados y me interesa una cotización.')
  const waLink = `https://wa.me/${companyInfo.whatsapp.replace(/\D/g, '')}?text=${waMessage}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative overflow-hidden rounded-[2rem] p-8 sm:p-10 mb-10"
        style={{ border: '1px solid var(--bd-1)', backgroundColor: 'var(--bg-raised)' }}>
        <div className="absolute inset-0 mesh-flow opacity-[0.16] dark:opacity-25 pointer-events-none" />
        <div className="blob w-72 h-72 -top-16 -right-10 bg-brand-400 opacity-30 animate-flow" />
        <div className="relative">
          <div className="section-badge mb-4">Galería</div>
          <h1 className="section-title">Trabajos <span className="gradient-text">terminados</span></h1>
          <p className="section-subtitle max-w-lg">Algunas de las instalaciones y mantenimientos que hemos entregado a nuestros clientes</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Carrusel items={TRABAJOS_TERMINADOS} miniaturas alto="h-[420px] sm:h-[560px]" />

        <div className="mt-10 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(21,128,61,0.12), rgba(21,128,61,0.06))', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div>
            <p className="font-semibold" style={{ color: 'var(--tx-1)' }}>¿Necesitas un trabajo así?</p>
            <p className="text-sm text-green-700 dark:text-green-400">Escríbenos por WhatsApp y te cotizamos</p>
          </div>
          <a href={waLink} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-full transition-all hover:-translate-y-0.5">
            <FaWhatsapp size={15} /> Cotizar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
