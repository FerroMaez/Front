import { create } from 'zustand'

// Restaurar sesión desde localStorage al cargar la app
const savedToken = localStorage.getItem('manhid-token')
const savedUser  = (() => {
  try { return JSON.parse(localStorage.getItem('manhid-user') || 'null') } catch { return null }
})()

export const useAuthStore = create((set, get) => ({
  user:            savedToken && savedUser ? savedUser : null,
  token:           savedToken || null,
  isAuthenticated: !!(savedToken && savedUser),

  login: (user, token) => {
    localStorage.setItem('manhid-token', token)
    localStorage.setItem('manhid-user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('manhid-token')
    localStorage.removeItem('manhid-user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  setUser: (user) => {
    localStorage.setItem('manhid-user', JSON.stringify(user))
    set({ user })
  },

  isCliente:  () => get().user?.rol === 'CLIENTE',
  isEmpleado: () => ['EMPLEADO', 'JEFE'].includes(get().user?.rol),
  isJefe:     () => get().user?.rol === 'JEFE',
}))
