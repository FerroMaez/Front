import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('manhid-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 = sesión vencida → volver al login. Excepto en las propias rutas de login
    // (/auth/...): ahí un 401 es "credenciales inválidas" y la página debe mostrar el error,
    // no recargarse (antes el mensaje desaparecía al instante).
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
      localStorage.removeItem('manhid-token')
      localStorage.removeItem('manhid-user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
