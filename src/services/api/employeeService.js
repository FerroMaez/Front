import api from './axiosInstance'
import { mockEmployees } from '../../features/catalog/mockProducts'

const USE_MOCK = true

export const employeeService = {
  getAll: async () => {
    if (USE_MOCK) return mockEmployees
    return api.get('/usuarios/empleados').then(r => r.data)
  },

  create: async (payload) => {
    if (USE_MOCK) {
      if (mockEmployees.find(e => e.email === payload.email)) throw { response: { status: 409, data: { message: 'Ya existe un usuario con este email en el sistema.' } } }
      const emp = { id: `E${Date.now()}`, ...payload, rol: 'EMPLEADO', estado: 'ACTIVO', fecha_creacion: new Date().toISOString().split('T')[0], ultimo_acceso: null }
      mockEmployees.push(emp)
      return emp
    }
    return api.post('/usuarios/empleados', payload).then(r => r.data)
  },

  update: async (id, payload) => {
    if (USE_MOCK) {
      const idx = mockEmployees.findIndex(e => e.id === id)
      if (idx >= 0) mockEmployees[idx] = { ...mockEmployees[idx], ...payload }
      return mockEmployees[idx]
    }
    return api.put(`/usuarios/empleados/${id}`, payload).then(r => r.data)
  },

  deactivate: async (id) => {
    if (USE_MOCK) {
      const emp = mockEmployees.find(e => e.id === id)
      if (emp) emp.estado = 'INACTIVO'
      return { ok: true }
    }
    return api.patch(`/usuarios/empleados/${id}/desactivar`).then(r => r.data)
  },
}
