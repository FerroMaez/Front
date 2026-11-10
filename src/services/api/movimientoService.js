import api from './axiosInstance'

const mapMovimiento = (m) => ({
  id: m.id,
  fecha: m.fecha,
  usuario: m.usuario || m.usuarioEmail || 'Sistema',
  usuario_email: m.usuarioEmail,
  rol: m.rol,
  tipo: m.tipo,
  descripcion: m.descripcion,
  revertible: m.revertible,
  revertido: m.revertido,
  revertido_por: m.revertidoPor,
  fecha_reversion: m.fechaReversion,
  motivo_reversion: m.motivoReversion,
})

export const movimientoService = {
  /** Fechas 'YYYY-MM-DD' (sin fechas: los últimos 30 días). */
  listar: async ({ desde, hasta } = {}) =>
    api.get('/movimientos', { params: { desde: desde || undefined, hasta: hasta || undefined } }).then(r => r.data.map(mapMovimiento)),

  revertir: async (id, motivo) => api.post(`/movimientos/${id}/revertir`, { motivo: motivo || null }).then(r => mapMovimiento(r.data)),
}
