import { useEffect, useRef, useState } from 'react'
import Modal from '../../../components/ui/Modal'
import { abrirCamara, cargarModelos, cerrarCamara, detectar, posicionEnCirculo, promediar, OJO_ABIERTO } from '../../../features/asistencia/rostro'
import CirculoRostro, { MENSAJE_CIRCULO } from '../../../features/asistencia/CirculoRostro'

const CAPTURAS = 5

// Registro de la huella facial de un trabajador. Se hace UNA vez (desde la tablet o el
// celular del jefe). Se toman 5 lecturas y se guarda el promedio; la imagen no sale del equipo.
/** propio = el mismo vendedor registra su rostro (la autorización la da él, en primera persona). */
export default function RegistrarRostroModal({ trabajador, onClose, onGuardar, propio = false }) {
  const video = useRef(null)
  const stream = useRef(null)
  const [estado, setEstado] = useState('cargando') // cargando | listo | capturando | error
  const [progreso, setProgreso] = useState(0)
  const [guia, setGuia] = useState('sin-cara')
  const [consentimiento, setConsentimiento] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    ;(async () => {
      try {
        await cargarModelos()
        stream.current = await abrirCamara(video.current)
        if (!cancelado) setEstado('listo')
      } catch {
        if (!cancelado) { setError('No se pudo abrir la cámara. Revisa los permisos del navegador.'); setEstado('error') }
      }
    })()
    return () => { cancelado = true; cerrarCamara(stream.current) }
  }, [])

  const capturar = async () => {
    setError('')
    setEstado('capturando')
    const lecturas = []
    const limite = Date.now() + 15000
    while (lecturas.length < CAPTURAS && Date.now() < limite) {
      const cara = await detectar(video.current).catch(() => null)
      const pos = posicionEnCirculo(cara && cara.score > 0.7 ? cara : null)
      setGuia(pos)
      // Solo cuenta con la cara dentro del círculo, cerca y con los ojos abiertos (huella de calidad)
      if (pos === 'ok' && cara.ear > OJO_ABIERTO) {
        lecturas.push(Array.from(cara.descriptor))
        setProgreso(lecturas.length)
      }
      await new Promise((r) => setTimeout(r, 250))
    }
    if (lecturas.length < CAPTURAS) {
      setError('No se vio bien la cara. Ponla dentro del círculo, de frente, con buena luz y los ojos abiertos.')
      setEstado('listo'); setProgreso(0); setGuia('sin-cara')
      return
    }
    try {
      await onGuardar(promediar(lecturas), consentimiento)
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo guardar el rostro.')
      setEstado('listo'); setProgreso(0)
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={propio ? 'Registrar mi rostro' : `Registrar rostro: ${trabajador.nombre}`} size="lg">
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
          <video ref={video} playsInline muted className="w-full h-full object-cover -scale-x-100" />
          {estado === 'cargando' && <p className="absolute inset-0 flex items-center justify-center text-white text-sm">Preparando cámara…</p>}
          {estado !== 'cargando' && estado !== 'error' && (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <CirculoRostro estado={estado === 'capturando' ? guia : 'sin-cara'} progreso={progreso / CAPTURAS} className="h-[82%]" />
              </div>
              <p className="absolute bottom-3 inset-x-0 text-center text-white font-semibold drop-shadow">
                {estado === 'capturando' ? MENSAJE_CIRCULO[guia] : 'Pon tu cara dentro del círculo y pulsa "Registrar"'}
              </p>
            </>
          )}
        </div>

        <label className="flex items-start gap-3 p-3 rounded-xl text-xs leading-relaxed cursor-pointer"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--bd-1)', color: 'var(--tx-2)' }}>
          <input type="checkbox" checked={consentimiento} onChange={(e) => setConsentimiento(e.target.checked)} className="mt-0.5" />
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
          <button onClick={capturar} disabled={!consentimiento || estado !== 'listo'}
            className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-50">
            {estado === 'capturando' ? 'Capturando…' : 'Registrar rostro'}
          </button>
          <button onClick={onClose} className="btn-outline flex-1 justify-center">Cancelar</button>
        </div>
      </div>
    </Modal>
  )
}
