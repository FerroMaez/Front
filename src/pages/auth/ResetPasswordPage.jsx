import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { authService } from '../../services/api/authService'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!password || password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    if (!token) { setError('Enlace inválido. Solicita uno nuevo.'); return }
    setLoading(true)
    try {
      await authService.resetearPassword(token, password)
      navigate('/login', { state: { mensaje: 'Contraseña actualizada. Ya puedes iniciar sesión.' } })
    } catch (err) {
      setError(err?.response?.data?.error || 'El enlace es inválido o ha expirado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl p-8 shadow-xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
          <div className="text-center mb-8">
            <img src="/newLogo3.jpeg" alt="MANHID" className="w-14 h-14 rounded-2xl object-cover mx-auto mb-4 ring-2 ring-brand-500/40" />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Nueva contraseña</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--tx-3)' }}>Elige una contraseña segura</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-colors"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: 'var(--tx-3)' }}>
                  {showPwd ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>Confirmar contraseña</label>
              <input
                type={showPwd ? 'text' : 'password'} autoComplete="new-password"
                placeholder="Repite la contraseña"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white transition-all hover:-translate-y-px shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--tx-3)' }}>
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
