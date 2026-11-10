import api from './axiosInstance'
import { whatsappService } from './whatsappService'

export const mapOrder = (o) => ({
  id: o.id,
  estado: o.estado,
  total_cotizacion: Number(o.totalCotizacion) || 0,
  // Lo que pagó el cliente; las órdenes sin ese dato se cuentan por el total de los productos.
  total_pagado: o.totalPagado != null ? Number(o.totalPagado) : null,
  motivo_cancelacion: o.motivoCancelacion,
  es_venta_fisica: o.esVentaFisica,
  descripcion: o.descripcion,
  fecha_creacion: o.fechaCreacion,
  fecha_cierre: o.fechaCierre,
  facturacion_estado: o.facturacionEstado,
  cufe: o.cufe,
  pdf_url: o.pdfUrl,
  xml_url: o.xmlUrl,
  error_facturacion: o.errorFacturacion,
  cliente_id: o.clienteId ?? null,
  metodo_pago: o.metodoPago || null,
  recibido_por: o.recibidoPor || null,
  monto_deuda: Number(o.montoDeuda) || 0,
  saldo_deuda: Number(o.saldoDeuda) || 0,
  abonos: (o.abonos || []).map(a => ({
    id: a.id, monto: Number(a.monto) || 0, metodo_pago: a.metodoPago, recibido_por: a.recibidoPor, fecha: a.fecha,
  })),
  cliente: o.clienteInfo ? {
    nombre:    o.clienteInfo.nombre,
    telefono:  o.clienteInfo.telefono,
    email:     o.clienteInfo.email,
    cedula:    o.clienteInfo.cedula,
    direccion: o.clienteInfo.direccion,
    nit:       o.clienteInfo.nit,
  } : null,
  items: (o.items || []).map(i => ({
    id: i.id,
    producto_id: i.productoId,
    nombre: i.nombreProducto,
    pulgadas: i.pulgadas || '',
    cantidad: i.cantidad,
    precio_unitario_momento: Number(i.precioUnitario) || 0,
    tipo_precio: i.tipoPrecio || null,
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

  /** Con `productoId`: historial de ese producto (las órdenes que lo incluyen). */
  getAll: async ({ productoId } = {}) => {
    return api.get('/ordenes', { params: { productoId: productoId || undefined } }).then(r => r.data.map(mapOrder))
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

  // `clave`: UUID de la venta. Si la respuesta se pierde y se reintenta (o la venta pasa a la
  // cola offline con esa misma clave), el backend NO la registra dos veces.
  // `pago`: { totalPagado, metodoPago, recibidoPor, montoDeuda }
  ventaFisica: async (items, cliente, descripcion, clave, pago = {}) => {
    return api.post('/ordenes/venta-fisica', {
      items: items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad, tipoPrecio: i.tipoPrecio || 'ECONOMICO' })),
      cliente,
      descripcion,
      totalPagado: pago.totalPagado,
      metodoPago: pago.metodoPago,
      recibidoPor: pago.recibidoPor,
      montoDeuda: pago.montoDeuda,
    }, { headers: clave ? { 'Idempotency-Key': clave } : {} }).then(r => mapOrder(r.data))
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
