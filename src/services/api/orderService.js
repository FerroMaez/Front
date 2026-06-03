import api from './axiosInstance'
import { mockOrders, mockProducts } from '../../features/catalog/mockProducts'

const USE_MOCK = true

export const orderService = {
  confirm: async ({ items }) => {
    if (USE_MOCK) {
      for (const item of items) {
        const p = mockProducts.find(p => p.id === item.producto_id)
        if (!p || p.stock_disponible < item.cantidad)
          throw { response: { status: 409, data: { message: `Stock insuficiente: ${p?.nombre || 'Producto'}. Disponible: ${p?.stock_disponible ?? 0}, Solicitado: ${item.cantidad}` } } }
      }
      const ordenId = `ORD-${String(mockOrders.length + 1).padStart(3, '0')}`
      const total = items.reduce((s, i) => {
        const p = mockProducts.find(p => p.id === i.producto_id)
        return s + (p?.precio_unitario || 0) * i.cantidad
      }, 0)
      items.forEach(item => {
        const p = mockProducts.find(p => p.id === item.producto_id)
        if (p) { p.stock_disponible -= item.cantidad; p.stock_reservado += item.cantidad }
      })
      const order = { id: ordenId, estado: 'PENDIENTE', total_cotizacion: total, fecha_creacion: new Date().toISOString(), items }
      mockOrders.unshift(order)
      return order
    }
    return api.post('/ordenes/confirmar', { items }).then(r => r.data)
  },

  getMyOrders: async () => {
    if (USE_MOCK) return mockOrders.filter(o => ['VENTA_EXITOSA', 'CANCELADA'].includes(o.estado)).slice(0, 5)
    return api.get('/ordenes/mis-ordenes').then(r => r.data)
  },

  getAll: async () => {
    if (USE_MOCK) return mockOrders
    return api.get('/ordenes').then(r => r.data)
  },

  updateStatus: async (id, { estado, motivo_cancelacion }) => {
    if (USE_MOCK) {
      const o = mockOrders.find(o => o.id === id)
      if (!o) throw new Error('Orden no encontrada')
      if (['VENTA_EXITOSA', 'CANCELADA'].includes(o.estado)) throw { response: { status: 409, data: { message: 'Este estado no puede modificarse. La orden ya fue cerrada.' } } }
      if (estado === 'CANCELADA') {
        o.items?.forEach(item => {
          const p = mockProducts.find(p => p.id === item.producto_id)
          if (p) { p.stock_disponible += item.cantidad; p.stock_reservado -= item.cantidad }
        })
        o.motivo_cancelacion = motivo_cancelacion
      }
      if (estado === 'VENTA_EXITOSA') {
        o.items?.forEach(item => {
          const p = mockProducts.find(p => p.id === item.producto_id)
          if (p) { p.stock_reservado -= item.cantidad }
        })
      }
      o.estado = estado
      o.fecha_cierre = new Date().toISOString()
      return o
    }
    return api.patch(`/ordenes/${id}/estado`, { estado, motivo_cancelacion }).then(r => r.data)
  },
}
