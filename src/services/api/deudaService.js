import api from './axiosInstance'
import { mapOrder } from './orderService'

export const deudaService = {
  /** Órdenes con saldo pendiente (de la más antigua a la más reciente), con sus abonos. */
  listar: async () => api.get('/deudores').then(r => r.data.map(mapOrder)),

  /** Registra un pago del cliente sobre lo que debe en esa orden. */
  abonar: async (ordenId, { monto, metodoPago, recibidoPor }) =>
    api.post(`/deudores/${ordenId}/abonos`, { monto, metodoPago, recibidoPor }).then(r => r.data),
}

export const cajeroService = {
  /** Quiénes pueden recibir pagos en caja. */
  listar: async () => api.get('/cajeros').then(r => r.data),
}
