import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa'
import { companyInfo } from '../../features/catalog/catalogData'

const contactItems = [
  { icon: <FaPhone size={18} />,       label: 'Teléfonos',  value: `${companyInfo.phone1} / ${companyInfo.phone2}`, href: `tel:${companyInfo.phone1.replace(/\s/g,'')}` },
  { icon: <FaWhatsapp size={18} />,    label: 'WhatsApp',   value: companyInfo.whatsapp, href: `https://wa.me/${companyInfo.whatsapp.replace(/\D/g,'')}` },
  { icon: <FaEnvelope size={18} />,    label: 'Email',      value: companyInfo.email.toLowerCase(), href: `mailto:${companyInfo.email}` },
  { icon: <FaMapMarkerAlt size={18} />,label: 'Dirección',  value: `${companyInfo.address}, ${companyInfo.city}`, href: 'https://maps.google.com/?q=Carrera+23+12-93+Los+Mártires+Bogotá' },
  { icon: <FaClock size={18} />,       label: 'Horario',    value: `${companyInfo.hours.weekdays} · ${companyInfo.hours.saturday}` },
]

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header — banner con flujo de agua */}
      <div className="relative overflow-hidden rounded-[2rem] p-8 sm:p-10 mb-10"
        style={{ border: '1px solid var(--bd-1)', backgroundColor: 'var(--bg-raised)' }}>
        <div className="absolute inset-0 mesh-flow opacity-[0.16] dark:opacity-25 pointer-events-none" />
        <div className="blob w-72 h-72 -top-16 -left-10 bg-aqua-500 opacity-30 animate-flow" />
        <div className="relative">
          <div className="section-badge mb-4">Estamos aquí para ayudarte</div>
          <h1 className="section-title">Contác<span className="gradient-text">tanos</span></h1>
          <p className="section-subtitle max-w-lg">Asesoría personalizada para tus sistemas hidráulicos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Info de contacto */}
        <div className="space-y-4">
          {contactItems.map(({ icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4 p-5 rounded-2xl transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-aqua-600 dark:text-aqua-300"
                style={{ backgroundColor: 'rgba(6,182,212,0.14)' }}>
                {icon}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--tx-3)' }}>
                  {label}
                </p>
                {href ? (
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                    className="text-sm font-medium transition-colors hover:text-brand-500 dark:hover:text-brand-300"
                    style={{ color: 'var(--tx-1)' }}>
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-medium" style={{ color: 'var(--tx-1)' }}>{value}</p>
                )}
              </div>
            </div>
          ))}

          {/* Redes */}
          <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--tx-3)' }}>
              Redes Sociales
            </p>
            <div className="flex gap-3">
              <a href={companyInfo.social.instagram} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-pink-500/15 hover:text-pink-600 dark:hover:text-pink-400"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--bd-1)', color: 'var(--tx-2)' }}>
                <FaInstagram size={15} /> Instagram
              </a>
              <a href={companyInfo.social.facebook} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-blue-500/15 hover:text-blue-600 dark:hover:text-blue-400"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--bd-1)', color: 'var(--tx-2)' }}>
                <FaFacebook size={15} /> Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Mapa + CTA */}
        <div className="space-y-5">
          <div className="rounded-3xl overflow-hidden shadow-raised" style={{ border: '1px solid var(--bd-1)' }}>
            <div className="p-4" style={{ borderBottom: '1px solid var(--bd-1)', backgroundColor: 'var(--bg-raised)' }}>
              <h3 className="font-semibold flex items-center gap-2 text-sm" style={{ color: 'var(--tx-1)' }}>
                <FaMapMarkerAlt className="text-aqua-500" size={14} />
                Nuestra ubicación
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--tx-3)' }}>
                {companyInfo.address}, {companyInfo.city}
              </p>
            </div>
            <div className="aspect-[4/3]">
              <iframe
                title="Ubicación MANHID"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.915510751023!2d-74.09060792065429!3d4.609144500000007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f99ff735d9773%3A0x5984693f7593050c!2sMANTENIMIENTOS%20HIDR%C3%81ULICOS%20KM!5e0!3m2!1ses!2sco!4v1784867936142!5m2!1ses!2sco"
                width="100%" height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="p-6 rounded-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(21,128,61,0.14), rgba(21,128,61,0.06))', border: '1px solid rgba(34,197,94,0.25)' }}>
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--tx-1)' }}>
              ¿Necesitas respuesta rápida?
            </h3>
            <p className="text-sm mb-4 text-green-700 dark:text-green-400">
              Escríbenos por WhatsApp y te atendemos de inmediato.
            </p>
            <a
              href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent('Hola MANHID, necesito información sobre sus servicios.')}`}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full transition-all hover:-translate-y-0.5 shadow-md shadow-green-900/20 text-sm"
            >
              <FaWhatsapp size={18} />
              Chatear por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
