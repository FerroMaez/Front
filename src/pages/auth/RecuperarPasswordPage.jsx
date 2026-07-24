import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../services/api/authService'

export default function RecuperarPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email) { setError('Ingresa tu email.'); return }
    setLoading(true)
    try {
      await authService.solicitarRecuperacion(email)
      setEnviado(true)
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.')
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
            <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Recuperar contraseña</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--tx-3)' }}>Te enviaremos un enlace a tu correo</p>
          </div>

          {enviado ? (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--tx-1)' }}>
                Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </div>
              <Link to="/login" className="block text-sm text-brand-600 dark:text-brand-400 hover:underline mt-4">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-xl text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--tx-2)' }}>Email</label>
                  <input
                    type="email" autoComplete="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white transition-all hover:-translate-y-px shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>
              <p className="text-center text-sm mt-6" style={{ color: 'var(--tx-3)' }}>
                <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                  Volver al inicio de sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
