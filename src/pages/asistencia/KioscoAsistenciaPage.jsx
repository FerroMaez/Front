import { useCallback, useEffect, useRef, useState } from 'react'
import { asistenciaService } from '../../services/api/asistenciaService'
import {
  abrirCamara, cargarModelos, cerrarCamara, detectar, promediar,
  OJO_ABIERTO, OJO_CERRADO, TAMANO_MINIMO,
} from '../../features/asistencia/rostro'

// Pantalla de la tablet de la entrada (pantalla completa, sin login).
// Solo funciona dentro del túnel WireGuard: fuera de él el backend responde 403.
//
// Flujo: buscando cara → "parpadea" (prueba de vida: una foto no parpadea) →
//        captura 3 huellas con los ojos abiertos → envía el promedio → muestra el resultado.

const INTERVALO_MS = 200
const RESULTADO_MS = 5000
const CAPTURAS = 3

const formatoHora = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })

export default function KioscoAsistenciaPage() {
  const video = useRef(null)
  const stream = useRef(null)
  const estado = useRef({ fase: 'buscando', cerrado: false, capturas: [], sinCaraDesde: null, desde: 0 })
  const [fase, setFase] = useState('verificando') // verificando | no-autorizado | cargando | buscando | parpadea | enviando | resultado | no-reconocido | error
  const [mensaje, setMensaje] = useState('')
  const [resultado, setResultado] = useState(null)
  const [reloj, setReloj] = useState(new Date())

  const irA = useCallback((f) => { estado.current = { ...estado.current, fase: f, desde: Date.now() }; setFase(f) }, [])
  const reiniciar = useCallback(() => {
    estado.current = { fase: 'buscando', cerrado: false, capturas: [], sinCaraDesde: null, desde: Date.now() }
    setFase('buscando')
  }, [])

  // Reloj grande en pantalla
  useEffect(() => { const t = setInterval(() => setReloj(new Date()), 1000); return () => clearInterval(t) }, [])

  // Mantener la pantalla encendida mientras la página esté abierta
  useEffect(() => {
    let lock = null
    const pedir = () => navigator.wakeLock?.request('screen').then((l) => { lock = l }).catch(() => {})
    pedir()
    document.addEventListener('visibilitychange', pedir)
    return () => { document.removeEventListener('visibilitychange', pedir); lock?.release().catch(() => {}) }
  }, [])

  // 1) ¿Estamos dentro del túnel? 2) modelos 3) cámara
  useEffect(() => {
    let cancelado = false
    ;(async () => {
      try {
        await asistenciaService.estadoKiosco()
      } catch (e) {
        if (!cancelado) {
          setMensaje(e.response?.status === 403
            ? 'Este equipo no está conectado a la red de la empresa. Activa WireGuard y recarga.'
            : 'No hay conexión con el servidor. Revisa internet y WireGuard.')
          setFase('no-autorizado')
        }
        return
      }
      try {
        setFase('cargando')
        await cargarModelos()
        stream.current = await abrirCamara(video.current)
        if (!cancelado) reiniciar()
      } catch {
        if (!cancelado) { setMensaje('No se pudo abrir la cámara. Revisa los permisos del navegador.'); setFase('error') }
      }
    })()
    return () => { cancelado = true; cerrarCamara(stream.current) }
  }, [reiniciar])

  const enviar = useCallback(async (descriptores) => {
    irA('enviando')
    try {
      const r = await asistenciaService.marcar(promediar(descriptores))
      setResultado(r)
      irA('resultado')
    } catch (e) {
      setMensaje(e.response?.data?.error || 'No se pudo registrar. Inténtalo de nuevo.')
      irA(e.response?.status === 403 ? 'no-autorizado' : 'no-reconocido')
    }
    setTimeout(reiniciar, RESULTADO_MS)
  }, [irA, reiniciar])

  // Bucle de detección
  useEffect(() => {
    let vivo = true
    const paso = async () => {
      const s = estado.current
      if (['buscando', 'parpadea'].includes(s.fase)) {
        const cara = await detectar(video.current).catch(() => null)
        const ahora = Date.now()
        if (!cara || cara.tamano < TAMANO_MINIMO) {
          s.sinCaraDesde ??= ahora
          if (s.fase === 'parpadea' && ahora - s.sinCaraDesde > 1500) reiniciar()   // se fue
        } else {
          s.sinCaraDesde = null
          if (s.fase === 'buscando') {
            irA('parpadea')
          } else if (cara.ear < OJO_CERRADO) {
            s.cerrado = true                                        // parpadeó
          } else if (s.cerrado && cara.ear > OJO_ABIERTO) {
            s.capturas.push(Array.from(cara.descriptor))            // ojos abiertos tras el parpadeo
            if (s.capturas.length >= CAPTURAS) enviar(s.capturas)
          }
        }
      }
      if (vivo) setTimeout(paso, INTERVALO_MS)
    }
    paso()
    return () => { vivo = false }
  }, [irA, reiniciar, enviar])

  const esEntrada = resultado?.tipo === 'ENTRADA'

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col items-center justify-center select-none overflow-hidden">
      <video ref={video} playsInline muted
        className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity ${['buscando', 'parpadea', 'enviando'].includes(fase) ? 'opacity-60' : 'opacity-0'}`} />

      <div className="relative z-10 text-center px-6 max-w-xl">
        <p className="text-6xl font-bold tabular-nums">{reloj.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}</p>
        <p className="text-lg opacity-80 mb-10 first-letter:uppercase">{reloj.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

        {fase === 'verificando' && <Aviso>Conectando…</Aviso>}
        {fase === 'cargando' && <Aviso>Preparando el reconocimiento facial…</Aviso>}
        {fase === 'buscando' && <Aviso>Acércate a la cámara para marcar tu entrada o salida</Aviso>}
        {fase === 'parpadea' && <Aviso grande>👁️ Parpadea despacio</Aviso>}
        {fase === 'enviando' && <Aviso>Verificando…</Aviso>}

        {fase === 'resultado' && resultado && (
          <div className={`rounded-3xl p-8 ${esEntrada ? 'bg-emerald-600' : 'bg-sky-600'}`}>
            <p className="text-4xl font-bold">{esEntrada ? '¡Hola' : '¡Hasta luego'}, {resultado.nombre.split(' ')[0]}!</p>
            <p className="text-2xl mt-3">{esEntrada ? 'Entrada' : 'Salida'} registrada a las {formatoHora(resultado.fechaHora)}</p>
            {resultado.repetida && <p className="mt-3 opacity-90">Ya habías marcado hace un momento.</p>}
            {resultado.tarde && !resultado.repetida && <p className="mt-3 font-semibold bg-amber-500/90 rounded-xl py-2">Llegada tarde</p>}
          </div>
        )}
        {fase === 'no-reconocido' && <div className="rounded-3xl p-8 bg-rose-600 text-xl">{mensaje}</div>}
        {['no-autorizado', 'error'].includes(fase) && (
          <div className="rounded-3xl p-8 bg-rose-700 text-xl">
            {mensaje}
            <button onClick={() => window.location.reload()} className="block mx-auto mt-5 px-6 py-3 rounded-xl bg-white text-rose-700 font-bold">Reintentar</button>
          </div>
        )}
      </div>
    </div>
  )
}

function Aviso({ children, grande = false }) {
  return <p className={`${grande ? 'text-5xl font-bold' : 'text-2xl'} drop-shadow-lg`}>{children}</p>
}
