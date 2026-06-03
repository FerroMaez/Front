import api from './axiosInstance'

const USE_MOCK = true

const mockUsers = [
  { id: 1, nombre: 'Cliente Demo', email: 'cliente@demo.com', password: '123456', telefono: '310 111 2222', rol: 'CLIENTE', estado: 'ACTIVO' },
  { id: 2, nombre: 'Empleado Demo', email: 'empleado@manhid.com', password: '123456', telefono: '310 333 4444', rol: 'EMPLEADO', estado: 'ACTIVO' },
  { id: 3, nombre: 'Jefe Demo', email: 'jefe@manhid.com', password: '123456', telefono: '310 555 6666', rol: 'JEFE', estado: 'ACTIVO' },
]

export const authService = {
  login: async ({ email, password }) => {
    if (USE_MOCK) {
      const user = mockUsers.find(u => u.email === email && u.password === password)
      if (!user) throw { response: { status: 401, data: { message: 'Email o contraseña incorrectos.' } } }
      if (user.estado !== 'ACTIVO') throw { response: { status: 403, data: { message: 'Tu cuenta no está activa. Contáctanos para más información.' } } }
      const token = `mock-jwt-${user.rol.toLowerCase()}-${Date.now()}`
      return { accessToken: token, usuario: { id: user.id, nombre: user.nombre, email: user.email, telefono: user.telefono, rol: user.rol } }
    }
    return api.post('/auth/login', { email, password }).then(r => r.data)
  },

  register: async (payload) => {
    if (USE_MOCK) {
      if (mockUsers.find(u => u.email === payload.email)) throw { response: { status: 409, data: { message: 'Ya existe una cuenta con ese email. ¿Olvidaste tu contraseña?' } } }
      const newUser = { ...payload, id: Date.now(), rol: 'CLIENTE', estado: 'ACTIVO' }
      mockUsers.push(newUser)
      const token = `mock-jwt-cliente-${Date.now()}`
      return { accessToken: token, usuario: { id: newUser.id, nombre: newUser.nombre, email: newUser.email, telefono: newUser.telefono, rol: 'CLIENTE' } }
    }
    return api.post('/auth/register', payload).then(r => r.data)
  },

  logout: async () => {
    if (USE_MOCK) return { ok: true }
    return api.post('/auth/logout').then(r => r.data)
  },
}
