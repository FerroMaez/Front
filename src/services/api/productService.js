import api from './axiosInstance'

const toBackendPayload = (p) => ({
  nombre: p.nombre,
  descripcion: p.descripcion,
  imagenUrl: p.imagen_url || p.imagenUrl,
  precioUnitario: p.precio_unitario ?? p.precioUnitario,
  stockDisponible: p.stock_disponible ?? p.stockDisponible,
  stockMinimo: p.stock_minimo ?? p.stockMinimo,
  lineaServicio: p.linea_servicio || p.lineaServicio,
  categoria: p.categoria,
})

const mapProduct = (p) => ({
  id: p.id,
  nombre: p.nombre,
  descripcion: p.descripcion,
  imagen_url: p.imagenUrl,
  precio_unitario: p.precioUnitario,
  stock_disponible: p.stockDisponible,
  stock_minimo: p.stockMinimo,
  stock_reservado: p.stockReservado,
  linea_servicio: p.lineaServicio,
  categoria: p.categoria,
  estado: p.estado,
  fecha_creacion: p.fechaCreacion,
  ultima_modificacion: p.ultimaModificacion,
})

export const productService = {
  getAll: async (params = {}) => {
    const list = await api.get('/productos', { params: { search: params.search } }).then(r => r.data)
    let data = list.map(mapProduct)
    if (params.categoria) data = data.filter(p => p.categoria === params.categoria)
    return { data, total: data.length }
  },

  getById: async (id) => {
    return api.get(`/productos/${id}`).then(r => mapProduct(r.data))
  },

  create: async (payload) => {
    return api.post('/productos', toBackendPayload(payload)).then(r => mapProduct(r.data))
  },

  update: async (id, payload) => {
    return api.put(`/productos/${id}`, toBackendPayload(payload)).then(r => mapProduct(r.data))
  },

  delete: async (id) => {
    return api.delete(`/productos/${id}`).then(() => ({ ok: true }))
  },
}
