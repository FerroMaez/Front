import { create } from 'zustand'
import {
  CLAVE_TOKEN, CLAVE_REFRESH, CLAVE_USUARIO,
  cerrarSesionEnServidor, iniciarRenovacionAutomatica, onRenovar,
} from '../services/api/sesion'

// Restaurar sesión desde localStorage al cargar la app
const savedToken = localStorage.getItem(CLAVE_TOKEN)
const savedUser  = (() => {
  try { return JSON.parse(localStorage.getItem(CLAVE_USUARIO) || 'null') } catch { return null }
})()

const limpiarSesion = () => {
  localStorage.removeItem(CLAVE_TOKEN)
  localStorage.removeItem(CLAVE_REFRESH)
  localStorage.removeItem(CLAVE_USUARIO)
}

export const useAuthStore = create((set, get) => ({
  user:            savedToken && savedUser ? savedUser : null,
  token:           savedToken || null,
  isAuthenticated: !!(savedToken && savedUser),

  login: (user, token, refreshToken) => {
    localStorage.setItem(CLAVE_TOKEN, token)
    if (refreshToken) localStorage.setItem(CLAVE_REFRESH, refreshToken)
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  /** Cierre manual: la sesión termina también en el servidor (el refresh token deja de servir). */
  logout: () => {
    const refresh = localStorage.getItem(CLAVE_REFRESH)
    limpiarSesion()
    set({ user: null, token: null, isAuthenticated: false })
    cerrarSesionEnServidor(refresh)
  },

  setUser: (user) => {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(user))
    set({ user })
  },

  isCliente:  () => get().user?.rol === 'CLIENTE',
  isEmpleado: () => ['EMPLEADO', 'JEFE'].includes(get().user?.rol),
  isJefe:     () => get().user?.rol === 'JEFE',
}))

// El token nuevo de cada renovación también queda en el estado
onRenovar((token) => useAuthStore.setState({ token }))

// Renovación automática: la sesión sigue abierta mientras no se cierre manualmente
iniciarRenovacionAutomatica(() => {
  limpiarSesion()
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  if (!window.location.pathname.startsWith('/login')) window.location.href = '/login'
})

// Si se cierra sesión en otra pestaña, esta también se cierra
window.addEventListener('storage', (e) => {
  if (e.key === CLAVE_TOKEN && !e.newValue && useAuthStore.getState().isAuthenticated) {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    if (!window.location.pathname.startsWith('/login')) window.location.href = '/login'
  }
})
