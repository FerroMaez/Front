import api from './axiosInstance'
import { whatsappService } from './whatsappService'

const mapOrder = (o) => ({
  id: o.id,
  estado: o.estado,
  total_cotizacion: Number(o.totalCotizacion) || 0,
  motivo_cancelacion: o.motivoCancelacion,
  fecha_creacion: o.fechaCreacion,
  fecha_cierre: o.fechaCierre,
  facturacion_estado: o.facturacionEstado,
  cufe: o.cufe,
  pdf_url: o.pdfUrl,
  xml_url: o.xmlUrl,
  error_facturacion: o.errorFacturacion,
  cliente: o.clienteInfo ? {
    nombre:   o.clienteInfo.nombre,
    telefono: o.clienteInfo.telefono,
    email:    o.clienteInfo.email,
  } : null,
  items: (o.items || []).map(i => ({
    id: i.id,
    producto_id: i.productoId,
    nombre: i.nombreProducto,
    cantidad: i.cantidad,
    precio_unitario_momento: Number(i.precioUnitario) || 0,
    subtotal: Number(i.subtotal) || 0,
  })),
})

export const orderService = {
  confirm: async ({ items, user }) => {
    const backendItems = items.map(i => ({ productoId: i.producto_id, cantidad: i.cantidad }))
    const rawOrder = await api.post('/ordenes/confirmar', { items: backendItems }).then(r => r.data)
    const order = mapOrder(rawOrder)
    whatsappService.notifyOrder({ order, items: order.items, user }).catch(() => {})
    return order
  },

  getMyOrders: async () => {
    return api.get('/ordenes/mis-ordenes').then(r => r.data.map(mapOrder))
  },

  getAll: async () => {
    return api.get('/ordenes').then(r => r.data.map(mapOrder))
  },

  updateStatus: async (id, { estado, motivo_cancelacion }) => {
    return api.patch(`/ordenes/${id}/estado`, {
      estado,
      motivoCancelacion: motivo_cancelacion,
    }).then(r => mapOrder(r.data))
  },

  aprobar: async (id) => {
    return api.post(`/ordenes/${id}/aprobar`).then(r => mapOrder(r.data))
  },

  ventaFisica: async (items, cliente) => {
    return api.post('/ordenes/venta-fisica', {
      items: items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad })),
      cliente,
    }).then(r => mapOrder(r.data))
  },

  exportExcel: async () => {
    const response = await api.get('/ordenes/export/excel', { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([response.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `ventas_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}
