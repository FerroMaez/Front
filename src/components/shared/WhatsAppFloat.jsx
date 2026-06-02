import { FaWhatsapp } from 'react-icons/fa'
import { companyInfo } from '../../features/catalog/catalogData'

export default function WhatsAppFloat() {
  const number = companyInfo.whatsapp.replace(/\D/g, '')
  const message = encodeURIComponent('Hola MANHID, quisiera obtener más información sobre sus servicios hidráulicos.')

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
      aria-label="Contactar por WhatsApp"
    >
      <span className="hidden group-hover:block bg-[#071525] text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg border border-white/10 whitespace-nowrap">
        ¡Escríbenos!
      </span>
      <div className="w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-all hover:scale-110">
        <FaWhatsapp size={28} className="text-white" />
      </div>
    </a>
  )
}
