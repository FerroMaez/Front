import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { authService } from '../../services/api/authService'
import { useAuthStore } from '../../store/authStore'

const TIPOS_ID = [
  { value: '13', label: 'Cédula de ciudadanía (CC)' },
  { value: '31', label: 'NIT' },
  { value: '22', label: 'Cédula de extranjería (CE)' },
  { value: '12', label: 'Tarjeta de identidad' },
  { value: '91', label: 'CUIL' },
]

const TIPOS_RESPONSABILIDAD = [
  { value: 'R-99-PN', label: 'No responsable del IVA (persona natural)' },
  { value: 'O-13',    label: 'Gran contribuyente' },
  { value: 'O-15',    label: 'Autorretenedor' },
  { value: 'O-23',    label: 'Agente de retención IVA' },
  { value: 'O-47',    label: 'Régimen simple de tributación' },
]

export default function RegisterPage() {
  const navigate  = useNavigate()
  const { login } = useAuthStore()

  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', password: '', confirm: '',
    identificacion: '', digitoVerificacion: '', tipoIdentificacion: '',
    tipoResponsabilidadFiscal: '', codigoMunicipioDane: '', direccion: '',
  })
  const [errors,  setErrors]  = useState({})
  const [apiErr,  setApiErr]  = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const inputSty = (key) => ({
    backgroundColor: 'var(--bg-input)',
    border: `1px solid ${errors[key] ? '#ef4444' : 'var(--bd-1)'}`,
    color: 'var(--tx-1)',
  })

  // funciones helper — NO son componentes React, se llaman como funciones normales
  const field = (key, label, type = 'text', placeholder = '', extra = {}) => (
    <div key={key}>
      <label htmlFor={`r-${key}`} className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>{label}</label>
      <input id={`r-${key}`} type={type} placeholder={placeholder} value={form[key]}
        onChange={set(key)} maxLength={extra.maxLength}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
        style={inputSty(key)} />
      {errors[key]
        ? <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
        : extra.hint && <p className="mt-1 text-xs" style={{ color: 'var(--tx-3)' }}>{extra.hint}</p>
      }
    </div>
  )

  const selectField = (key, label, options) => (
    <div key={key}>
      <label htmlFor={`r-${key}`} className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>{label}</label>
      <select id={`r-${key}`} value={form[key]} onChange={set(key)}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
        style={inputSty(key)}>
        <option value="">Selecciona…</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  )

  const sectionLabel = (text) => (
    <p className="text-xs font-bold uppercase tracking-widest pt-2" style={{ color: 'var(--tx-3)' }}>{text}</p>
  )

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())   e.nombre   = 'El nombre es obligatorio.'
    if (!form.email)           e.email    = 'El email es obligatorio.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Formato inválido.'
    if (!form.telefono)        e.telefono = 'El teléfono es obligatorio.'
    if (!form.password)        e.password = 'La contraseña es obligatoria.'
    else if (form.password.length < 8)     e.password = 'Mínimo 8 caracteres.'
    else if (!/[A-Z]/.test(form.password)) e.password = 'Debe incluir una mayúscula.'
    else if (!/\d/.test(form.password))    e.password = 'Debe incluir un número.'
    if (form.password !== form.confirm)    e.confirm  = 'Las contraseñas no coinciden.'

    if (!form.tipoIdentificacion)          e.tipoIdentificacion = 'Selecciona el tipo.'
    if (!form.identificacion.trim())       e.identificacion = 'El número es obligatorio.'
    else if (!/^\d+$/.test(form.identificacion)) e.identificacion = 'Solo dígitos.'
    if (form.tipoIdentificacion === '31' && !form.digitoVerificacion.trim())
      e.digitoVerificacion = 'Obligatorio para NIT.'
    if (!form.tipoResponsabilidadFiscal)   e.tipoResponsabilidadFiscal = 'Selecciona el tipo.'
    if (!form.codigoMunicipioDane.trim())  e.codigoMunicipioDane = 'El código es obligatorio.'
    else if (!/^\d{5}$/.test(form.codigoMunicipioDane)) e.codigoMunicipioDane = 'Debe ser 5 dígitos (ej: 11001).'
    if (!form.direccion.trim())            e.direccion = 'La dirección es obligatoria.'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiErr('')
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        nombre: form.nombre, email: form.email, telefono: form.telefono,
        password: form.password,
        identificacion: form.identificacion,
        digitoVerificacion: form.tipoIdentificacion === '31' ? form.digitoVerificacion : null,
        tipoIdentificacion: form.tipoIdentificacion,
        tipoResponsabilidadFiscal: form.tipoResponsabilidadFiscal,
        codigoMunicipioDane: form.codigoMunicipioDane,
        direccion: form.direccion,
      }
      const { accessToken, usuario } = await authService.register(payload)
      login(usuario, accessToken)
      navigate('/', { replace: true })
    } catch (err) {
      setApiErr(err?.response?.data?.message || err?.response?.data?.error || 'Error al registrarse.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl p-8 shadow-xl animate-fadein" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
          <div className="text-center mb-8">
            <img src="/newLogo3.jpeg" alt="MANHID" className="w-14 h-14 rounded-2xl object-cover mx-auto mb-4 ring-2 ring-brand-500/40" />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Crear Cuenta</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--tx-3)' }}>Regístrate para cotizar productos</p>
          </div>

          {apiErr && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20">{apiErr}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {sectionLabel('Datos personales')}

            {field('nombre',   'Nombre completo',  'text',     'Juan Pérez')}
            {field('email',    'Email',            'email',    'correo@ejemplo.com')}
            {field('telefono', 'Teléfono',         'tel',      '310 000 0000')}

            {/* Contraseña */}
            <div>
              <label htmlFor="r-password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>Contraseña</label>
              <div className="relative">
                <input id="r-password" type={showPwd ? 'text' : 'password'}
                  placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                  value={form.password} onChange={set('password')}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-colors"
                  style={inputSty('password')} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: 'var(--tx-3)' }}>
                  {showPwd ? <FaEyeSlash size={16}/> : <FaEye size={16}/>}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {field('confirm', 'Confirmar contraseña', showPwd ? 'text' : 'password', 'Repite la contraseña')}

            {/* ── Datos de facturación ── */}
            {sectionLabel('Datos de facturación electrónica')}
            <p className="text-xs -mt-1" style={{ color: 'var(--tx-3)' }}>
              Necesarios para emitir facturas DIAN. Puedes editarlos después en tu perfil.
            </p>

            {selectField('tipoIdentificacion', 'Tipo de identificación', TIPOS_ID)}
            {field('identificacion', 'Número de identificación', 'text', 'Ej: 123456789')}
            {form.tipoIdentificacion === '31' && field('digitoVerificacion', 'Dígito de verificación (NIT)', 'text', 'Ej: 9')}
            {selectField('tipoResponsabilidadFiscal', 'Tipo de responsabilidad fiscal', TIPOS_RESPONSABILIDAD)}
            {field('codigoMunicipioDane', 'Código DANE del municipio', 'text', 'Ej: 11001 (Bogotá)', { maxLength: 5, hint: 'Código de 5 dígitos según el DANE' })}
            {field('direccion', 'Dirección fiscal', 'text', 'Calle 1 # 2-3, Bogotá')}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white transition-all hover:-translate-y-px shadow-md disabled:opacity-60">
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--tx-3)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
