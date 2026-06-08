import api from './axiosInstance'
import { companyInfo } from '../../features/catalog/catalogData'
import { formatCOP } from '../../utils/formatters'

export const whatsappService = {
  notifyOrder: async ({ order, items, user }) => {
    const itemLines = items
      .map(i => {
        const qty = Number(i.qty ?? i.cantidad ?? 0)
        const linea = Number(i.subtotal) || Number(i.precio_unitario_momento || i.precio_unitario || 0) * qty
        return `• ${i.nombre || i.nombreProducto} ×${qty} — ${formatCOP(linea)}`
      })
      .join('\n')

    const mensaje = [
      `🛒 *Nueva Cotización ${order.id}*`,
      ``,
      `*Cliente:* ${user?.nombre || 'N/A'}`,
      `*Teléfono:* ${user?.telefono || 'N/A'}`,
      ``,
      `*Productos:*`,
      itemLines,
      ``,
      `*Total estimado:* ${formatCOP(order.total_cotizacion)}`,
    ].join('\n')

    return api.post('/notificaciones/whatsapp', {
      numero: companyInfo.whatsapp,
      mensaje,
    }).then(r => r.data)
  },
}
