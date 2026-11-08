import api from './axiosInstance'

const num = (v) => (v == null ? null : Number(v))

export const historicoService = {
  /** Ventas exitosas con valor de adquisición, valor de venta y ganancia. Fechas 'YYYY-MM-DD' opcionales. */
  consultar: async ({ desde, hasta } = {}) => {
    const { data } = await api.get('/historicos', { params: { desde: desde || undefined, hasta: hasta || undefined } })
    return {
      ventas: data.ventas.map(v => ({
        orden_id: v.ordenId,
        fecha: v.fecha,
        cliente: v.cliente,
        producto_id: v.productoId,
        producto: v.producto,
        pulgadas: v.pulgadas || '',
        cantidad: v.cantidad,
        valor_adquisicion: num(v.valorAdquisicion),
        valor_venta: num(v.valorVenta),
        ganancia: num(v.ganancia),
      })),
      informe: data.informe.map(i => ({
        producto_id: i.productoId,
        producto: i.producto,
        pulgadas: i.pulgadas || '',
        unidades: i.unidades,
        total_adquisicion: num(i.totalAdquisicion),
        total_vendido: num(i.totalVendido),
        total_ganancia: num(i.totalGanancia),
        unidades_sin_valor: i.unidadesSinValorAdquisicion,
      })),
      totales: {
        unidades: data.totales.unidades,
        total_adquisicion: num(data.totales.totalAdquisicion),
        total_vendido: num(data.totales.totalVendido),
        total_ganancia: num(data.totales.totalGanancia),
        unidades_sin_valor: data.totales.unidadesSinValorAdquisicion,
      },
    }
  },
}
