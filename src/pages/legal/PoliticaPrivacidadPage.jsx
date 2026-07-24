import { Link } from 'react-router-dom'
import { FaShieldAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

const sections = [
  {
    title: '1. Responsable del tratamiento',
    content: `MANHID – Mantenimientos Hidráulicos KM, con domicilio en Bogotá, Colombia, y correo electrónico de contacto: mantenimientos@mantenimientos-hidraulicos-km.cloud, es el responsable del tratamiento de los datos personales recolectados a través de este sitio web y del sistema HydroStock.`,
  },
  {
    title: '2. Datos que recolectamos',
    content: `Recolectamos únicamente los datos necesarios para la operación del servicio:
• Nombre completo
• Correo electrónico
• Número de teléfono
• Historial de cotizaciones y pedidos realizados a través de la plataforma`,
  },
  {
    title: '3. Finalidad del tratamiento',
    content: `Los datos personales son utilizados exclusivamente para:
• Crear y gestionar su cuenta de usuario
• Procesar cotizaciones y órdenes de productos hidráulicos
• Enviar notificaciones relacionadas con sus pedidos
• Recuperación de contraseña mediante correo electrónico
• Cumplir con obligaciones legales y comerciales`,
  },
  {
    title: '4. Compartición de datos',
    content: `MANHID no vende, alquila ni comparte sus datos personales con terceros con fines comerciales. Los datos únicamente son accesibles por el personal autorizado de MANHID para la atención de sus solicitudes.`,
  },
  {
    title: '5. Almacenamiento y seguridad',
    content: `Sus datos se almacenan en servidores seguros con cifrado. Implementamos medidas técnicas y organizativas para proteger su información frente a accesos no autorizados, pérdida o alteración, incluyendo autenticación con tokens JWT y contraseñas cifradas con BCrypt.`,
  },
  {
    title: '6. Tiempo de conservación',
    content: `Sus datos serán conservados mientras mantenga una cuenta activa en la plataforma. Al solicitar la eliminación de su cuenta, sus datos serán eliminados en un plazo máximo de 30 días hábiles, salvo obligación legal de conservación.`,
  },
  {
    title: '7. Derechos del titular',
    content: `De acuerdo con la Ley 1581 de 2012, usted tiene derecho a:
• Conocer, actualizar y rectificar sus datos personales
• Solicitar prueba de la autorización otorgada
• Revocar la autorización y solicitar la supresión de sus datos
• Presentar quejas ante la Superintendencia de Industria y Comercio (SIC)

Para ejercer estos derechos, escríbanos a: mantenimientos@mantenimientos-hidraulicos-km.cloud`,
  },
  {
    title: '8. Base legal',
    content: `El tratamiento de datos personales se realiza en cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013 de la República de Colombia.`,
  },
  {
    title: '9. Cambios a esta política',
    content: `MANHID se reserva el derecho de actualizar esta política. Cualquier cambio relevante será notificado a los usuarios registrados mediante correo electrónico con al menos 10 días de anticipación.`,
  },
]

export default function PoliticaPrivacidadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="mb-10">
        <div className="section-badge mb-4">Legal</div>
        <h1 className="section-title">Política de Privacidad</h1>
        <p className="section-subtitle">
          Última actualización: junio de 2025 · Vigente según Ley 1581 de 2012
        </p>
      </div>

      {/* Banner intro */}
      <div className="flex items-start gap-4 p-5 rounded-2xl mb-10"
        style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
        <FaShieldAlt className="text-brand-500 flex-shrink-0 mt-0.5" size={22} />
        <p className="text-sm leading-relaxed" style={{ color: 'var(--tx-2)' }}>
          En MANHID nos comprometemos a proteger su información personal. Esta política describe
          de forma clara qué datos recolectamos, para qué los usamos y cómo los protegemos,
          en cumplimiento de la legislación colombiana de protección de datos personales.
        </p>
      </div>

      {/* Secciones */}
      <div className="space-y-8">
        {sections.map(({ title, content }) => (
          <div key={title} className="p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
            <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--tx-1)' }}>
              {title}
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--tx-2)' }}>
              {content}
            </p>
          </div>
        ))}
      </div>

      {/* Contacto */}
      <div className="mt-10 p-6 rounded-2xl"
        style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid rgba(140,144,59,0.3)' }}>
        <h2 className="font-semibold text-base mb-4" style={{ color: 'var(--tx-1)' }}>
          Contacto para protección de datos
        </h2>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-sm" style={{ color: 'var(--tx-2)' }}>
            <FaEnvelope className="text-brand-500 flex-shrink-0" size={14} />
            <a href="mailto:mantenimientos@mantenimientos-hidraulicos-km.cloud"
              className="hover:text-brand-300 transition-colors">
              mantenimientos@mantenimientos-hidraulicos-km.cloud
            </a>
          </li>
          <li className="flex items-center gap-3 text-sm" style={{ color: 'var(--tx-2)' }}>
            <FaMapMarkerAlt className="text-brand-500 flex-shrink-0" size={14} />
            <span>Bogotá, Colombia</span>
          </li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="btn-outline text-sm">Volver al inicio</Link>
      </div>
    </div>
  )
}
