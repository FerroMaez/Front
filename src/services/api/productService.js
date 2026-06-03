import api from './axiosInstance'
import { mockProducts } from '../../features/catalog/mockProducts'

const USE_MOCK = true

export const productService = {
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let data = mockProducts.filter(p => p.estado === 'ACTIVO')
      if (params.categoria) data = data.filter(p => p.categoria === params.categoria)
      if (params.search)    data = data.filter(p => p.nombre.toLowerCase().includes(params.search.toLowerCase()))
      return { data, total: data.length }
    }
    return api.get('/productos', { params }).then(r => r.data)
  },

  getById: async (id) => {
    if (USE_MOCK) return mockProducts.find(p => p.id === Number(id))
    return api.get(`/productos/${id}`).then(r => r.data)
  },

  create: async (payload) => {
    if (USE_MOCK) {
      const newP = { ...payload, id: Date.now(), stock_reservado: 0, fecha_creacion: new Date().toISOString(), ultima_modificacion: new Date().toISOString() }
      mockProducts.push(newP)
      return newP
    }
    return api.post('/productos', payload).then(r => r.data)
  },

  update: async (id, payload) => {
    if (USE_MOCK) {
      const idx = mockProducts.findIndex(p => p.id === Number(id))
      if (idx >= 0) { mockProducts[idx] = { ...mockProducts[idx], ...payload, ultima_modificacion: new Date().toISOString() } }
      return mockProducts[idx]
    }
    return api.put(`/productos/${id}`, payload).then(r => r.data)
  },

  delete: async (id) => {
    if (USE_MOCK) {
      const idx = mockProducts.findIndex(p => p.id === Number(id))
      if (idx >= 0) mockProducts[idx].estado = 'INACTIVO'
      return { ok: true }
    }
    return api.delete(`/productos/${id}`).then(r => r.data)
  },
}
