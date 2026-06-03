import api from './axiosInstance'

const USE_MOCK = true
const mockRequests = []

export const maintenanceService = {
  create: async (payload) => {
    if (USE_MOCK) {
      const req = { id: Date.now(), ...payload, estado: 'PENDIENTE', fecha_solicitud: new Date().toISOString() }
      mockRequests.push(req)
      return req
    }
    return api.post('/mantenimientos', payload).then(r => r.data)
  },

  getAll: async () => {
    if (USE_MOCK) return mockRequests
    return api.get('/mantenimientos').then(r => r.data)
  },
}
