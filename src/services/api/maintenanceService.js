import api from './axiosInstance'

export const maintenanceService = {
  create: async (payload) => {
    return api.post('/mantenimientos', {
      tipoServicio: payload.tipo_servicio,
      descripcion: payload.descripcion,
      franjaHoraria: payload.franja_horaria,
    }).then(r => r.data)
  },

  getAll: async () => {
    return api.get('/mantenimientos').then(r => r.data)
  },
}
