import api from './axiosInstance'

const mapCliente = (c) => ({
  id: c.id,
  nombre: c.nombre || '',
  cedula: c.cedula || '',
  email: c.email || '',
  telefono: c.telefono || '',
  direccion: c.direccion || '',
  ultima_compra: c.ultimaCompra,
})

export const clienteService = {
  /** Clientes guardados de ventas físicas por nombre, cédula, teléfono o correo (sin texto: los más recientes). */
  buscar: async (q = '') => api.get('/clientes', { params: { q } }).then(r => r.data.map(mapCliente)),
}
