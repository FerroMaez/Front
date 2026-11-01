import { useEffect, useRef, useState } from 'react'

// Botón oficial "Iniciar sesión con Google" (Google Identity Services).
// Google muestra su propio botón y ventana; al terminar nos entrega un "credential"
// (ID token firmado por Google) que el backend verifica en /auth/google.
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCRIPT_URL = 'https://accounts.google.com/gsi/client'

let scriptPromise = null
function cargarScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = SCRIPT_URL
      s.async = true
      s.defer = true
      s.onload = resolve
      s.onerror = () => { scriptPromise = null; reject(new Error('No se pudo cargar Google')) }
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

/** @param {{ onCredential: (credential: string) => void, disabled?: boolean }} props */
export default function GoogleLoginButton({ onCredential, disabled = false }) {
  const contenedor = useRef(null)
  const callbackRef = useRef(onCredential)
  const [error, setError] = useState('')
  callbackRef.current = onCredential

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelado = false
    cargarScript()
      .then(() => {
        if (cancelado || !contenedor.current) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (resp) => callbackRef.current(resp.credential),
          ux_mode: 'popup',
          auto_select: false,
        })
        window.google.accounts.id.renderButton(contenedor.current, {
          type: 'standard', theme: 'outline', size: 'large', text: 'signin_with',
          shape: 'pill', logo_alignment: 'center', locale: 'es',
          width: Math.min(contenedor.current.offsetWidth || 320, 400),
        })
      })
      .catch(() => !cancelado && setError('No se pudo cargar el inicio de sesión con Google. Revisa tu conexión.'))
    return () => { cancelado = true }
  }, [])

  // Sin client-id configurado el botón no aparece (el login con contraseña sigue funcionando)
  if (!CLIENT_ID) return null

  return (
    <div>
      <div ref={contenedor} className="flex justify-center min-h-[44px]"
        style={{ pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? 0.6 : 1 }} />
      {error && <p className="mt-2 text-xs text-center text-red-500">{error}</p>}
    </div>
  )
}
