import { useState } from 'react'
import { FaWhatsapp, FaCheckCircle, FaTools, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa'
import { companyInfo } from '../../features/catalog/catalogData'
import { maintenanceService } from '../../services/api/maintenanceService'
import { useAuthStore } from '../../store/authStore'

const TIPOS = [
  { value: 'REVISION_GENERAL',       label: 'Revisión General' },
  { value: 'DETECCION_FUGAS',         label: 'Detección de Fugas' },
  { value: 'MANTENIMIENTO_PREVENTIVO',label: 'Mantenimiento Preventivo' },
  { value: 'INSTALACION_NUEVA',       label: 'Instalación Nueva' },
  { value: 'OTRO',                    label: 'Otro' },
]
const FRANJAS = [
  { value: 'MANANA',      label: 'Mañana (8am - 12pm)' },
  { value: 'TARDE',       label: 'Tarde (2pm - 6pm)' },
  { value: 'INDIFERENTE', label: 'Indiferente' },
]

const MIN_DATE = (() => {
  const d = new Date(); d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})()

const empty = { nombre: '', telefono: '', email: '', direccion: '', tipo: '', descripcion: '', fecha: '', franja: '' }

export default function MaintenancePage() {
  const { user } = useAuthStore()
  const [form,    setForm]    = useState({ ...empty, nombre: user?.nombre || '', telefono: user?.telefono || '', email: user?.email || '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiErr,  setApiErr]  = useState('')

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())       e.nombre    = 'Campo obligatorio.'
    if (!form.telefono.trim())     e.telefono  = 'Campo obligatorio.'
    if (!form.email.trim())        e.email     = 'Campo obligatorio.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido.'
    if (!form.direccion.trim())    e.direccion = 'Campo obligatorio.'
    if (!form.tipo)                e.tipo      = 'Selecciona el tipo de servicio.'
    if (!form.fecha)               e.fecha     = 'Selecciona la fecha.'
    if (!form.franja)              e.franja    = 'Selecciona la franja horaria.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setApiErr('')
    if (!validate()) return
    setLoading(true)
    try {
      await maintenanceService.create({
        solicitante_nombre:   form.nombre,
        solicitante_telefono: form.telefono,
        solicitante_email:    form.email,
        direccion_visita:     form.direccion,
        tipo_servicio:        form.tipo,
        descripcion:          form.descripcion,
        fecha_preferida:      form.fecha,
        franja_horaria:       form.franja,
      })
      setSuccess(true)
      setForm({ ...empty, nombre: user?.nombre || '', telefono: user?.telefono || '', email: user?.email || '' })
    } catch {
      setApiErr('Ocurrió un error al enviar tu solicitud. Por favor intenta de nuevo o contáctanos directamente.')
    } finally {
      setLoading(false)
    }
  }

  const inp = (label, key, type, placeholder, maxLen) => (
    <div>
      <label htmlFor={`f-${key}`} className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>{label} <span className="text-red-500">*</span></label>
      <input id={`f-${key}`} type={type || 'text'} placeholder={placeholder || ''} value={form[key]} maxLength={maxLen}
        onChange={e => set(key, e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
        style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors[key] ? '#ef4444' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }} />
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  )

  const waMessage = encodeURIComponent('Hola MANHID, me interesa información sobre sus servicios de mantenimiento hidráulico.')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative overflow-hidden rounded-[2rem] p-8 sm:p-10 mb-10"
        style={{ border: '1px solid var(--bd-1)', backgroundColor: 'var(--bg-raised)' }}>
        <div className="absolute inset-0 mesh-flow opacity-[0.16] dark:opacity-25 pointer-events-none" />
        <div className="blob w-72 h-72 -top-16 -right-10 bg-aqua-500 opacity-30 animate-flow-alt" />
        <div className="relative">
          <div className="section-badge mb-4">Servicio especializado</div>
          <h1 className="section-title">Manteni<span className="gradient-text">mientos</span></h1>
          <p className="section-subtitle max-w-lg">Servicio preventivo y correctivo para tus sistemas hidráulicos</p>
        </div>
      </div>

      {/* Hero imagen */}
      <div className="relative rounded-3xl overflow-hidden mb-14 group shadow-float" style={{ border: '1px solid var(--bd-1)' }}>
        <img src="/mantenimiento/1.png" alt="Mantenimiento hidráulico"
          className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
          onError={e => { e.target.src = '/sector.jpeg' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(8,20,30,0.9) 38%, rgba(8,20,30,0.35) 78%, transparent)' }} />
        <div className="absolute inset-0 flex items-center p-8 lg:p-14">
          <div className="max-w-lg">
            <div className="section-badge mb-3">Servicio destacado</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">Mantenimiento a Válvula Reguladora de Presión</h2>
            <p className="text-white/70 text-sm lg:text-base mb-5">Conserva la eficiencia de tu sistema hidráulico con nuestros servicios especializados.</p>
            <a href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g,'')}?text=${waMessage}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full text-sm transition-all hover:-translate-y-0.5">
              <FaWhatsapp size={15}/> Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Formulario */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--tx-1)' }}>Solicitar Visita Técnica</h2>

          {success && (
            <div className="mb-6 p-5 rounded-2xl flex items-start gap-4" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <FaCheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold" style={{ color: 'var(--tx-1)' }}>¡Solicitud enviada exitosamente!</p>
                <p className="text-sm mt-1" style={{ color: 'var(--tx-2)' }}>
                  Tu solicitud de visita técnica ha sido registrada. Un asesor se comunicará contigo en menos de 24 horas hábiles para confirmar la agenda.
                </p>
                <button onClick={() => setSuccess(false)} className="mt-3 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                  Enviar otra solicitud
                </button>
              </div>
            </div>
          )}

          {apiErr && (
            <div className="mb-4 p-4 rounded-xl text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20">{apiErr}</div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inp('Nombre completo',         'nombre',    'text',  'Juan Pérez', 100)}
                {inp('Teléfono de contacto',    'telefono',  'tel',   '310 000 0000', 20)}
              </div>
              {inp('Correo electrónico', 'email', 'email', 'correo@ejemplo.com', 150)}
              <div>
                <label htmlFor="f-direccion" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>
                  Dirección completa de la visita <span className="text-red-500">*</span>
                </label>
                <input id="f-direccion" type="text" placeholder="Cra. 10 # 15-30, Bogotá" value={form.direccion} maxLength={250}
                  onChange={e => set('direccion', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                  style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors.direccion ? '#ef4444' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }} />
                {errors.direccion && <p className="mt-1 text-xs text-red-500">{errors.direccion}</p>}
              </div>

              {/* Tipo */}
              <div>
                <label htmlFor="f-tipo" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>Tipo de servicio <span className="text-red-500">*</span></label>
                <select id="f-tipo" value={form.tipo} onChange={e => set('tipo', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors.tipo ? '#ef4444' : 'var(--bd-1)'}`, color: form.tipo ? 'var(--tx-1)' : 'var(--tx-3)' }}>
                  <option value="">Selecciona el tipo…</option>
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {errors.tipo && <p className="mt-1 text-xs text-red-500">{errors.tipo}</p>}
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="f-descripcion" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>Descripción del problema <span className="text-xs font-normal">(opcional)</span></label>
                <textarea id="f-descripcion" value={form.descripcion} maxLength={500} rows={3}
                  placeholder="Describe el problema o lo que necesitas..."
                  onChange={e => set('descripcion', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none transition-colors"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
                <p className="text-right text-xs mt-1" style={{ color: 'var(--tx-3)' }}>{form.descripcion.length}/500</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fecha */}
                <div>
                  <label htmlFor="f-fecha" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>Fecha preferida <span className="text-red-500">*</span></label>
                  <input id="f-fecha" type="date" value={form.fecha} min={MIN_DATE}
                    onChange={e => set('fecha', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                    style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors.fecha ? '#ef4444' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }} />
                  {errors.fecha && <p className="mt-1 text-xs text-red-500">{errors.fecha}</p>}
                </div>

                {/* Franja */}
                <div>
                  <label htmlFor="f-franja" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>Franja horaria <span className="text-red-500">*</span></label>
                  <select id="f-franja" value={form.franja} onChange={e => set('franja', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors.franja ? '#ef4444' : 'var(--bd-1)'}`, color: form.franja ? 'var(--tx-1)' : 'var(--tx-3)' }}>
                    <option value="">Selecciona…</option>
                    {FRANJAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  {errors.franja && <p className="mt-1 text-xs text-red-500">{errors.franja}</p>}
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3.5 text-sm disabled:opacity-60">
                {loading ? 'Enviando solicitud…' : 'Enviar Solicitud'}
              </button>
            </form>
          )}
        </div>

        {/* Lateral */}
        <div className="lg:col-span-2 space-y-5">
          {[
            { icon: <FaTools size={18}/>,       title: 'Preventivo', desc: 'Inspección, ajuste y calibración periódica de componentes hidráulicos.' },
            { icon: <FaShieldAlt size={18}/>,   title: 'Correctivo',  desc: 'Diagnóstico y reparación de fallas para restablecer el funcionamiento.' },
            { icon: <FaCalendarAlt size={18}/>, title: 'Programado',  desc: 'Planes anuales con visitas periódicas y seguimiento de historial.' },
          ].map(({ icon, title, desc }) => (
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
            <p className="font-semibold mb-1" style={{ color: 'var(--tx-1)' }}>¿Respuesta inmediata?</p>
            <p className="text-xs mb-4 text-green-700 dark:text-green-400">Escríbenos por WhatsApp</p>
            <a href={`https://wa.me/${companyInfo.whatsapp.replace(/\D/g,'')}?text=${waMessage}`}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-full transition-all hover:-translate-y-0.5">
              <FaWhatsapp size={15}/> Chatear ahora
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
