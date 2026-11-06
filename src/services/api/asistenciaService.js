import api from './axiosInstance'

export const asistenciaService = {
  // ── Kiosco sin login (apagado salvo que el backend tenga ASISTENCIA_RED_KIOSCO) ──
  estadoKiosco: () => api.get('/asistencia/kiosco/estado').then((r) => r.data),
  marcar: (descriptor) => api.post('/asistencia/marcar', { descriptor }).then((r) => r.data),

  // ── Vendedor: "Mi asistencia" ──
  miAsistencia: () => api.get('/asistencia/yo').then((r) => r.data),
  registrarMiRostro: (descriptor, consentimiento) =>
    api.put('/asistencia/yo/rostro', { descriptor, consentimiento }).then((r) => r.data),
  borrarMiRostro: () => api.delete('/asistencia/yo/rostro').then((r) => r.data),
  // Compara solo contra el rostro del vendedor logueado (1 a 1); solo funciona dentro del túnel
  marcarMiAsistencia: (descriptor) => api.post('/asistencia/yo/marcar', { descriptor }).then((r) => r.data),

  // ── Jefes ──
  trabajadores: () => api.get('/asistencia/trabajadores').then((r) => r.data),
  crearTrabajador: (nombre, documento) =>
    api.post('/asistencia/trabajadores', { nombre, documento }).then((r) => r.data),
  cambiarActivo: (id, activo) => api.patch(`/asistencia/trabajadores/${id}/activo`, { activo }).then((r) => r.data),
  registrarRostro: (id, descriptor, consentimiento) =>
    api.put(`/asistencia/trabajadores/${id}/rostro`, { descriptor, consentimiento }).then((r) => r.data),
  borrarRostro: (id) => api.delete(`/asistencia/trabajadores/${id}/rostro`).then((r) => r.data),
  reporte: (desde, hasta) => api.get('/asistencia/reporte', { params: { desde, hasta } }).then((r) => r.data),
}
