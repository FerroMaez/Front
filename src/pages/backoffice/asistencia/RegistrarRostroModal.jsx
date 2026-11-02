import { useState } from 'react'
import { FaCheckCircle, FaTimes } from 'react-icons/fa'
import Modal from '../../../components/ui/Modal'
import { useCapturaRostro } from '../../../features/asistencia/useCapturaRostro'
import CirculoRostro, { MENSAJE_CIRCULO } from '../../../features/asistencia/CirculoRostro'

const CAPTURAS = 5
const CIERRE_MS = 2200

// Registro de la huella facial (una sola vez). Se toman 5 lecturas con la cara dentro del
// círculo y los ojos abiertos y se guarda el promedio; la imagen no sale del equipo.
// Al guardarse, el popup se pone VERDE y se cierra solo.
/**
 * @param propio   el mismo vendedor registra su rostro (autorización en primera persona)
 * @param onGuardar(huella, consentimiento)  guarda en el servidor (lanza error si falla)
 * @param onListo  se llama al cerrarse tras el éxito (para recargar la página)
 */
export default function RegistrarRostroModal({ trabajador, onClose, onGuardar, onListo, propio = false }) {
  const [consentimiento, setConsentimiento] = useState(false)
  const [capturando, setCapturando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  const camara = useCapturaRostro({
    habilitado: !exito,
    leyendo: capturando,
    capturas: CAPTURAS,
    seguidas: false,           // en el registro no hace falta que sean seguidas: cuenta las buenas
    exigirOjosAbiertos: true,  // huella de calidad
    onCompleto: async (huella) => {
      try {
        await onGuardar(huella, consentimiento)
        setExito(true)
        setTimeout(() => { onListo?.(); onClose() }, CIERRE_MS)
      } catch (e) {
        setError(e.response?.data?.error || 'No se pudo guardar el rostro.')
        setCapturando(false)
        camara.reiniciar()
      }
    },
  })

  const empezar = () => { setError(''); camara.reiniciar(); setCapturando(true) }

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <div className={`-m-5 p-5 rounded-2xl transition-colors duration-300 ${exito ? 'bg-emerald-600 text-white' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={exito ? undefined : { color: 'var(--tx-1)' }}>
            {propio ? 'Registrar mi rostro' : `Registrar rostro: ${trabajador.nombre}`}
          </h3>
          <button onClick={onClose} aria-label="Cerrar" className="p-1.5 rounded-lg hover:bg-black/10"><FaTimes /></button>
        </div>

        {exito ? (
          <div className="text-center py-12 animate-fadein">
            <FaCheckCircle size={72} className="mx-auto mb-5" />
            <p className="text-3xl font-bold">¡Rostro registrado!</p>
            <p className="text-lg mt-2 opacity-95">{propio ? 'Ya puedes marcar tu entrada y salida.' : `${trabajador.nombre} ya puede marcar.`}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
              <video ref={camara.video} playsInline muted className="w-full h-full object-cover -scale-x-100" />
              {camara.estado === 'cargando' && <p className="absolute inset-0 flex items-center justify-center text-white text-sm">Preparando cámara…</p>}
              {camara.estado === 'listo' && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CirculoRostro estado={capturando ? camara.guia : 'sin-cara'} progreso={camara.progreso} className="h-[82%]" />
                  </div>
                  <p className="absolute bottom-3 inset-x-0 text-center text-white font-semibold drop-shadow">
                    {capturando ? MENSAJE_CIRCULO[camara.guia] : 'Pon tu cara dentro del círculo y pulsa "Registrar"'}
                  </p>
                </>
              )}
            </div>
            {camara.estado === 'error' && <p className="text-sm text-red-500">No se pudo abrir la cámara. Revisa los permisos del navegador.</p>}

            <label className="flex items-start gap-3 p-3 rounded-xl text-xs leading-relaxed cursor-pointer"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--bd-1)', color: 'var(--tx-2)' }}>
              <input type="checkbox" checked={consentimiento} disabled={capturando}
                onChange={(e) => setConsentimiento(e.target.checked)} className="mt-0.5" />
              {propio ? (
                <span>
                  <strong style={{ color: 'var(--tx-1)' }}>Autorizo</strong> el tratamiento de mi dato biométrico (rostro) con la única
                  finalidad de registrar mi entrada y salida, conforme a la Ley 1581 de 2012. Sé que es voluntario, que no se guardan
                  fotos (solo una huella cifrada) y que puedo borrarlo cuando quiera desde "Mi asistencia".
                </span>
              ) : (
                <span>
                  <strong style={{ color: 'var(--tx-1)' }}>{trabajador.nombre}</strong> autorizó por escrito el tratamiento de su
                  dato biométrico (rostro) con la única finalidad de registrar su entrada y salida, conforme a la Ley 1581 de 2012.
                  Sabe que es voluntario, que puede pedir que se borre en cualquier momento y que no se guardan fotos.
                </span>
              )}
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button onClick={empezar} disabled={!consentimiento || capturando || camara.estado !== 'listo'}
                className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-50">
                {capturando ? 'Leyendo tu rostro…' : 'Registrar rostro'}
              </button>
              <button onClick={onClose} className="btn-outline flex-1 justify-center">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
