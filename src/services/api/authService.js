import api from './axiosInstance'

export const authService = {
  login: async ({ email, password }) => {
    const { accessToken } = await api.post('/auth/login', { email, password }).then(r => r.data)
    const usuario = await api.get('/usuarios/perfil', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(r => r.data)
    return { accessToken, usuario }
  },

  register: async (payload) => {
    await api.post('/auth/registro', payload)
    const { accessToken } = await api.post('/auth/login', {
      email: payload.email,
      password: payload.password,
    }).then(r => r.data)
    const usuario = await api.get('/usuarios/perfil', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(r => r.data)
    return { accessToken, usuario }
  },

  logout: async () => {
    return api.post('/auth/logout').catch(() => {})
  },

  updateProfile: async ({ nombre, telefono }) => {
    return api.put('/usuarios/perfil', { nombre, telefono }).then(r => r.data)
  },
}
