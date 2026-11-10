import api from './axiosInstance'
import { mapOrder } from './orderService'

const mapCliente = (c) => ({
  id: c.id,
  nombre: c.nombre || '',
  cedula: c.cedula || '',
  nit: c.nit || '',
  email: c.email || '',
  telefono: c.telefono || '',
  direccion: c.direccion || '',
  ultima_compra: c.ultimaCompra,
})

const num = (v) => Number(v) || 0

export const clienteService = {
  /** Clientes guardados de ventas físicas por nombre, cédula, NIT, teléfono o correo (sin texto: los más recientes). */
  buscar: async (q = '') => api.get('/clientes', { params: { q } }).then(r => r.data.map(mapCliente)),

  /** Todos los clientes con el resumen de sus compras. */
  historial: async () => api.get('/clientes/historial').then(r => r.data.map(h => ({
    ...mapCliente(h.cliente),
    compras: h.compras,
    total_productos: num(h.totalProductos),
    total_pagado: num(h.totalPagado),
    deuda: num(h.deuda),
    ultima_compra: h.ultimaCompra,
  }))),

  /** Todas las órdenes del cliente, con productos, pagos y abonos. */
  compras: async (id) => api.get(`/clientes/${id}/compras`).then(r => r.data.map(mapOrder)),
}
