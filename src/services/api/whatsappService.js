import api from './axiosInstance'
import { companyInfo } from '../../features/catalog/catalogData'
import { formatCOP } from '../../utils/formatters'

const USE_MOCK = true

export const whatsappService = {
  notifyOrder: async ({ order, items, user }) => {
    const itemLines = items
      .map(i => `• ${i.nombre} ×${i.qty ?? i.cantidad} — ${formatCOP((i.precio_unitario || 0) * (i.qty ?? i.cantidad))}`)
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

    if (USE_MOCK) {
      console.info('[WhatsApp] Notificación enviada al jefe:', mensaje)
      return { ok: true }
    }

    return api.post('/notificaciones/whatsapp', {
      numero: companyInfo.whatsapp,
      mensaje,
    }).then(r => r.data)
  },
}
