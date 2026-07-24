import api from './axiosInstance'

export const maintenanceService = {
  create: async (payload) => {
    return api.post('/mantenimientos', {
      tipoServicio:        payload.tipo_servicio,
      descripcion:         payload.descripcion,
      franjaHoraria:       payload.franja_horaria,
      solicitanteNombre:   payload.solicitante_nombre,
      solicitanteTelefono: payload.solicitante_telefono,
      solicitanteEmail:    payload.solicitante_email,
      direccionVisita:     payload.direccion_visita,
      fechaPreferida:      payload.fecha_preferida,
    }).then(r => r.data)
  },

  getAll: async () => {
    return api.get('/mantenimientos').then(r => r.data)
  },
}
