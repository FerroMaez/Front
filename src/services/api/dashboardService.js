import api from './axiosInstance'

const mapStats = (s) => ({
  totalOrdenes: s.totalOrdenes,
  ventasExitosas: s.ventasExitosas,
  ordenesCanceladas: s.ordenesCanceladas,
  ingresosTotales: Number(s.ingresosTotales) || 0,
  tasaConversion: s.tasaConversion,
  productosStockCritico: (s.productosStockCritico || []).map(p => ({
    id: p.id,
    nombre: p.nombre,
    imagen_url: p.imagenUrl,
    categoria: p.categoria,
    stock_disponible: p.stockDisponible,
    stock_minimo: p.stockMinimo,
  })),
})

export const dashboardService = {
  getStats: async () => api.get('/dashboard/stats').then(r => mapStats(r.data)),
}
