import { useEffect, useState } from 'react'
import { FaCheckCircle, FaTimes } from 'react-icons/fa'
import Modal from '../../../components/ui/Modal'
import { asistenciaService } from '../../../services/api/asistenciaService'
import { useCapturaRostro } from '../../../features/asistencia/useCapturaRostro'
import CirculoRostro, { MENSAJE_CIRCULO } from '../../../features/asistencia/CirculoRostro'

const CIERRE_MS = 2500
const hora = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })

// Popup del vendedor para marcar entrada/salida (en la tablet de la empresa).
// Cámara + círculo guía; al confirmar se pone VERDE con la hora y se cierra solo.
// Verifica que la cara sea la del vendedor logueado (1 a 1): nadie marca por otro desde su sesión.
// Solo funciona dentro del túnel WireGuard: fuera de él lo avisa sin abrir la cámara.
export default function MarcarAsistenciaModal({ onClose, onMarcado }) {
  const [red, setRed] = useState('verificando') // verificando | ok | fuera
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    asistenciaService.estadoKiosco()
      .then(() => setRed('ok'))
      .catch((e) => {
        setRed('fuera')
        setError(e.response?.status === 403
          ? 'Solo puedes marcar desde la tablet de la empresa (conectada a la VPN WireGuard).'
          : 'No hay conexión con el servidor. Revisa internet y la VPN.')
      })
  }, [])

  const camara = useCapturaRostro({
    habilitado: red === 'ok' && !resultado,
    onCompleto: async (huella) => {
      try {
        const r = await asistenciaService.marcarMiAsistencia(huella)
        setResultado(r)
        setTimeout(() => { onMarcado?.(r); onClose() }, CIERRE_MS)
      } catch (e) {
        setError(e.response?.data?.error || 'No se pudo registrar. Inténtalo de nuevo.')
        // 409 = ya tiene entrada y salida de hoy: no tiene sentido reintentar, se cierra
        if (e.response?.status === 409) setTimeout(() => { onMarcado?.(); onClose() }, CIERRE_MS)
        else setTimeout(() => { setError(''); camara.reiniciar() }, CIERRE_MS)
      }
    },
  })

  const esEntrada = resultado?.tipo === 'ENTRADA'

  return (
    <Modal isOpen onClose={onClose} size="md">
      <div className={`-m-5 p-5 rounded-2xl transition-colors duration-300 ${resultado ? 'bg-emerald-600 text-white' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={resultado ? undefined : { color: 'var(--tx-1)' }}>Marcar entrada / salida</h3>
          <button onClick={onClose} aria-label="Cerrar" className="p-1.5 rounded-lg hover:bg-black/10"><FaTimes /></button>
        </div>

        {resultado ? (
          // ── Validado: fondo verde, se cierra solo ──
          <div className="text-center py-10 animate-fadein">
            <FaCheckCircle size={72} className="mx-auto mb-5" />
            <p className="text-3xl font-bold">{esEntrada ? '¡Entrada registrada!' : '¡Salida registrada!'}</p>
            <p className="text-xl mt-2 opacity-95">{resultado.nombre.split(' ')[0]} · {hora(resultado.fechaHora)}</p>
            {resultado.tarde && !resultado.repetida && <p className="inline-block mt-4 px-4 py-1.5 rounded-xl bg-amber-500 font-semibold">Llegada tarde</p>}
            {resultado.repetida && <p className="mt-4 opacity-90">Ya habías marcado hace un momento.</p>}
          </div>
        ) : red === 'fuera' ? (
          <p className="p-6 rounded-xl text-center bg-red-500/10 border border-red-500/20 text-red-500">{error}</p>
        ) : (
          <>
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
              <video ref={camara.video} playsInline muted className="w-full h-full object-cover -scale-x-100" />
              {camara.estado === 'listo' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CirculoRostro estado={camara.guia} progreso={camara.progreso} className="h-[80%]" />
                </div>
              )}
              {(red === 'verificando' || camara.estado === 'cargando') && (
                <p className="absolute inset-0 flex items-center justify-center text-white text-sm">Preparando la cámara…</p>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center p-6 bg-red-600/90 text-white text-center font-semibold">{error}</div>
              )}
            </div>
            <p className="text-center font-semibold mt-4" style={{ color: 'var(--tx-1)' }}>
              {camara.estado === 'error' ? 'No se pudo abrir la cámara. Revisa los permisos del navegador.' : MENSAJE_CIRCULO[camara.guia]}
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}
