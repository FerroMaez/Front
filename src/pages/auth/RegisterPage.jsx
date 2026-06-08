import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { authService } from '../../services/api/authService'
import { useAuthStore } from '../../store/authStore'

export default function RegisterPage() {
  const navigate  = useNavigate()
  const { login } = useAuthStore()
  const [form,    setForm]    = useState({ nombre: '', email: '', telefono: '', password: '', confirm: '' })
  const [errors,  setErrors]  = useState({})
  const [apiErr,  setApiErr]  = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())   e.nombre   = 'El nombre es obligatorio.'
    if (!form.email)           e.email    = 'El email es obligatorio.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Formato de email inválido.'
    if (!form.telefono)        e.telefono = 'El teléfono es obligatorio.'
    if (!form.password)        e.password = 'La contraseña es obligatoria.'
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres.'
    else if (!/[A-Z]/.test(form.password)) e.password = 'Debe incluir al menos una mayúscula.'
    else if (!/[0-9]/.test(form.password)) e.password = 'Debe incluir al menos un número.'
    if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiErr('')
    if (!validate()) return
    setLoading(true)
    try {
      const { accessToken, usuario } = await authService.register({ nombre: form.nombre, email: form.email, telefono: form.telefono, password: form.password })
      login(usuario, accessToken)
      navigate('/', { replace: true })
    } catch (err) {
      setApiErr(err?.response?.data?.message || 'Error al registrarse.')
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>{label}</label>
      <input type={type} placeholder={placeholder} value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
        style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors[key] ? '#ef4444' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }} />
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl p-8 shadow-xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
          <div className="text-center mb-8">
            <img src="/newLogo3.jpeg" alt="MANHID" className="w-14 h-14 rounded-2xl object-cover mx-auto mb-4 ring-2 ring-brand-500/40" />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Crear Cuenta</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--tx-3)' }}>Regístrate para cotizar productos</p>
          </div>

          {apiErr && <div className="mb-4 p-3 rounded-xl text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20">{apiErr}</div>}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {field('nombre',   'Nombre completo',       'text',     'Juan Pérez')}
            {field('email',    'Email',                 'email',    'correo@ejemplo.com')}
            {field('telefono', 'Teléfono',              'tel',      '310 000 0000')}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>Contraseña</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-colors"
                  style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors.password ? '#ef4444' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: 'var(--tx-3)' }}>
                  {showPwd ? <FaEyeSlash size={16}/> : <FaEye size={16}/>}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {field('confirm', 'Confirmar contraseña', showPwd ? 'text' : 'password', 'Repite la contraseña')}

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
