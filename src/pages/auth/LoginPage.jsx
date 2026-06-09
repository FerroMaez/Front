import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { authService } from '../../services/api/authService'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuthStore()
  const returnTo  = location.state?.from || '/'

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [apiErr,  setApiErr]  = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (location.state?.mensaje) setSuccessMsg(location.state.mensaje)
  }, [location.state])

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'El email es obligatorio.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Formato de email inválido.'
    if (!form.password) e.password = 'La contraseña es obligatoria.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiErr('')
    if (!validate()) return
    setLoading(true)
    try {
      const { accessToken, usuario } = await authService.login(form)
      login(usuario, accessToken)
      let dest = '/perfil'
      if (usuario.rol === 'JEFE') dest = '/backoffice'
      else if (returnTo && returnTo !== '/') dest = returnTo
      navigate(dest, { replace: true })
    } catch (err) {
      setApiErr(err?.response?.data?.message || 'Error al iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl p-8 shadow-xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <img src="/newLogo3.jpeg" alt="MANHID" className="w-14 h-14 rounded-2xl object-cover mx-auto mb-4 ring-2 ring-brand-500/40" />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Iniciar Sesión</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--tx-3)' }}>Accede a tu cuenta de MANHID</p>
          </div>

          {/* Demo credentials hint */}
          <div className="mb-5 p-3 rounded-xl text-xs" style={{ backgroundColor: 'rgba(140,144,59,0.08)', border: '1px solid rgba(140,144,59,0.2)', color: 'var(--tx-2)' }}>
            <p className="font-semibold mb-1" style={{ color: 'var(--tx-1)' }}>Credenciales de prueba:</p>
            <p>Cliente: <span className="font-mono">cliente@demo.com</span> / <span className="font-mono">123456</span></p>
            <p>Empleado: <span className="font-mono">empleado@manhid.com</span> / <span className="font-mono">123456</span></p>
            <p>Jefe: <span className="font-mono">jefe@manhid.com</span> / <span className="font-mono">123456</span></p>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl text-sm text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20">
              {successMsg}
            </div>
          )}

          {apiErr && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20">
              {apiErr}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>Email</label>
              <input
                type="email" autoComplete="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors.email ? '#ef4444' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>Contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'} autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-colors"
                  style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors.password ? '#ef4444' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: 'var(--tx-3)' }}>
                  {showPwd ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              <div className="text-right mt-1">
                <Link to="/recuperar-password" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white transition-all hover:-translate-y-px shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--tx-3)' }}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
