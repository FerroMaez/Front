import { Link } from 'react-router-dom'
import { FaInstagram, FaFacebook, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import { companyInfo } from '../../features/catalog/catalogData'

const navLinks = [
  { label: 'Inicio',         to: '/' },
  { label: 'Catálogo',       to: '/catalogo' },
  { label: 'Quiénes Somos',  to: '/quienes-somos' },
  { label: 'Mantenimientos', to: '/mantenimientos' },
  { label: 'Contáctanos',    to: '/contacto' },
]

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ backgroundColor: 'var(--bg-footer)', borderTop: '1px solid rgba(140,144,59,0.2)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Marca */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-5">
              <img src="/newLogo3.jpeg" alt="MANHID"
                className="h-12 w-12 rounded-xl object-cover ring-2 ring-brand-500/50" />
              <div>
                <p className="text-white font-bold text-xl leading-none">MANHID</p>
                <p className="text-brand-400 text-xs font-semibold tracking-widest uppercase mt-0.5">
                  Sistemas Hidráulicos
                </p>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Más de 15 años de experiencia en suministro y mantenimiento
              de sistemas hidráulicos en Bogotá.
            </p>
            <div className="flex gap-2">
              {[
                { href: companyInfo.social.instagram, icon: <FaInstagram size={17} />, hover: 'hover:text-pink-400 hover:bg-pink-500/15' },
                { href: companyInfo.social.facebook,  icon: <FaFacebook  size={17} />, hover: 'hover:text-blue-400 hover:bg-blue-500/15'  },
                { href: `https://wa.me/${companyInfo.whatsapp.replace(/\D/g,'')}`, icon: <FaWhatsapp size={17} />, hover: 'hover:text-green-400 hover:bg-green-500/15' },
              ].map(({ href, icon, hover }) => (
                <a key={href} href={href} target="_blank" rel="noreferrer"
                  className={`p-2.5 rounded-xl text-gray-500 bg-white/5 transition-all ${hover}`}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Navegación</h4>
            <ul className="space-y-2.5">
              {navLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to}
                    className="text-gray-400 hover:text-brand-300 text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-brand-600 group-hover:bg-brand-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Contacto</h4>
            <ul className="space-y-3.5">
              {[
                { icon: <FaMapMarkerAlt size={13} />, text: `${companyInfo.address}, ${companyInfo.city}` },
                { icon: <FaPhone        size={13} />, text: `${companyInfo.phone1} / ${companyInfo.phone2}`,
                  href: `tel:${companyInfo.phone1.replace(/\s/g,'')}` },
                { icon: <FaEnvelope     size={13} />, text: companyInfo.email.toLowerCase(),
                  href: `mailto:${companyInfo.email}` },
                { icon: <FaClock        size={13} />, text: `Lun–Vie 8–18 h · Sáb 8–14 h` },
              ].map(({ icon, text, href }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-gray-400">
                  <span className="text-brand-500 mt-0.5 flex-shrink-0">{icon}</span>
                  {href
                    ? <a href={href} className="hover:text-brand-300 transition-colors">{text}</a>
                    : <span>{text}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p>© {new Date().getFullYear()} MANHID. Todos los derechos reservados.</p>
          <p>Bogotá, Colombia · <span className="text-brand-600">#8C903B</span></p>
        </div>
      </div>
    </footer>
  )
}
