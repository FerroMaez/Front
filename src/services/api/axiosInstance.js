import axios from 'axios'
import { CLAVE_TOKEN, CLAVE_REFRESH, CLAVE_USUARIO, renovarSesion, renovarSiHaceFalta } from './sesion'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  // Si el token está por vencer, se renueva antes de enviar la petición
  const token = config.url?.startsWith('/auth/') ? localStorage.getItem(CLAVE_TOKEN) : await renovarSiHaceFalta()
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    // 401 en las rutas de login (/auth/...) es "credenciales inválidas": la página muestra el error.
    if (error.response?.status === 401 && original && !original.url?.startsWith('/auth/')) {
      // Token vencido: se renueva una vez y se repite la petición
      if (!original._reintento && localStorage.getItem(CLAVE_REFRESH)) {
        original._reintento = true
        const nuevo = await renovarSesion()
        if (nuevo) {
          original.headers.Authorization = `Bearer ${nuevo}`
          return api(original)
        }
      }
      // La sesión ya no es válida (se cerró o venció por no usarse): volver al login
      localStorage.removeItem(CLAVE_TOKEN)
      localStorage.removeItem(CLAVE_REFRESH)
      localStorage.removeItem(CLAVE_USUARIO)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
