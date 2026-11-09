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

const n = (v) => Number(v) || 0

export const dashboardService = {
  getStats: async () => api.get('/dashboard/stats').then(r => mapStats(r.data)),

  /** Ventas, ingresos y deudores entre dos fechas 'YYYY-MM-DD' (sin fechas: hoy). */
  getPeriodo: async ({ desde, hasta } = {}) => {
    const { data: p } = await api.get('/dashboard/periodo', { params: { desde: desde || undefined, hasta: hasta || undefined } })
    return {
      desde: p.desde, hasta: p.hasta, ventas: p.ventas, unidades: p.unidades,
      valor_productos: n(p.valorProductos), ingresos: n(p.ingresos),
      ingresos_efectivo: n(p.ingresosEfectivo), ingresos_transferencia: n(p.ingresosTransferencia),
      abonos_recibidos: n(p.abonosRecibidos), deuda_generada: n(p.deudaGenerada),
      deudores: p.deudores, saldo_pendiente: n(p.saldoPendiente),
      recaudo: p.recaudo.map(r => ({ cajero: r.cajero, efectivo: n(r.efectivo), transferencia: n(r.transferencia), sin_dato: n(r.sinDato) })),
      por_dia: p.porDia.map(d => ({ fecha: d.fecha, ventas: d.ventas, ingresos: n(d.ingresos), deuda: n(d.deuda) })),
      lineas: p.lineas.map(l => ({
        orden_id: l.ordenId, fecha: l.fecha, cantidad: l.cantidad, producto: l.producto, pulgadas: l.pulgadas || '',
        descripcion: l.descripcion || '', precio_unitario: n(l.precioUnitario), subtotal: n(l.subtotal),
        cliente: l.cliente || '', metodo_pago: l.metodoPago, recibido_por: l.recibidoPor,
      })),
    }
  },
}
