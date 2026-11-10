// Sesión que no se cierra sola: el token de acceso (JWT) dura pocos minutos y se renueva con el
// refresh token antes de vencer. La sesión solo termina cuando el usuario cierra sesión (o si
// pasan muchos días sin usarla). Funciona igual con varias pestañas abiertas: todas comparten
// los tokens de localStorage.
import axios from 'axios'

export const CLAVE_TOKEN = 'manhid-token'
export const CLAVE_REFRESH = 'manhid-refresh'
export const CLAVE_USUARIO = 'manhid-user'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const MARGEN_MS = 2 * 60 * 1000      // renovar cuando falten menos de 2 minutos
const REVISAR_CADA_MS = 30 * 1000

/** Momento (ms) en que vence el JWT, leído de su contenido; 0 si no se puede leer. */
export function venceEn(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.exp ? payload.exp * 1000 : 0
  } catch {
    return 0
  }
}

let renovando = null   // una sola renovación a la vez (varias peticiones pueden pedirla juntas)
const alRenovar = new Set()

/** Pide tokens nuevos. Devuelve el access token nuevo, o null si la sesión ya no es válida. */
export function renovarSesion() {
  if (renovando) return renovando
  const refresh = localStorage.getItem(CLAVE_REFRESH)
  if (!refresh) return Promise.resolve(null)
  renovando = axios.post(`${API_URL}/auth/refresh`, { refreshToken: refresh }, { timeout: 10000 })
    .then(({ data }) => {
      localStorage.setItem(CLAVE_TOKEN, data.accessToken)
      localStorage.setItem(CLAVE_REFRESH, data.refreshToken)
      alRenovar.forEach(fn => fn(data.accessToken))
      return data.accessToken
    })
    .catch((err) => {
      // Otra pestaña pudo haber renovado justo antes: si ya hay un token vigente, se usa ese
      const actual = localStorage.getItem(CLAVE_TOKEN)
      if (actual && venceEn(actual) - Date.now() > MARGEN_MS) return actual
      // 401 = la sesión terminó de verdad. Sin conexión u otro error: se reintenta luego.
      return err.response?.status === 401 ? null : actual
    })
    .finally(() => { renovando = null })
  return renovando
}

/** Renueva solo si el token está por vencer (o ya venció). */
export async function renovarSiHaceFalta() {
  const token = localStorage.getItem(CLAVE_TOKEN)
  if (!token || !localStorage.getItem(CLAVE_REFRESH)) return token
  if (venceEn(token) - Date.now() > MARGEN_MS) return token
  return renovarSesion()
}

export function onRenovar(fn) {
  alRenovar.add(fn)
  return () => alRenovar.delete(fn)
}

/** Cierra en el servidor la sesión de este navegador (su refresh token deja de servir). */
export function cerrarSesionEnServidor(refreshToken) {
  if (!refreshToken) return Promise.resolve()
  return axios.post(`${API_URL}/auth/logout`, { refreshToken }, { timeout: 10000 }).catch(() => {})
}

let iniciado = false
/** Revisa el token cada 30 s y al volver a la pestaña; `alTerminar` se llama si la sesión ya no es válida. */
export function iniciarRenovacionAutomatica(alTerminar) {
  if (iniciado) return
  iniciado = true
  const revisar = async () => {
    if (!localStorage.getItem(CLAVE_TOKEN)) return
    const token = await renovarSiHaceFalta()
    if (token === null) alTerminar()
  }
  setInterval(revisar, REVISAR_CADA_MS)
  document.addEventListener('visibilitychange', () => { if (!document.hidden) revisar() })
  window.addEventListener('online', revisar)
  revisar()
}
