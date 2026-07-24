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

  updateProfile: async (data) => {
    return api.put('/usuarios/perfil', data).then(r => r.data)
  },

  solicitarRecuperacion: async (email) => {
    return api.post('/auth/recuperar-password', { email })
  },

  resetearPassword: async (token, nuevaPassword) => {
    return api.post('/auth/reset-password', { token, nuevaPassword })
  },
}
