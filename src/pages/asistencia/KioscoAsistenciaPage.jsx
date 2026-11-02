import { useCallback, useEffect, useRef, useState } from 'react'
import { asistenciaService } from '../../services/api/asistenciaService'
import { abrirCamara, cargarModelos, cerrarCamara, detectar, posicionEnCirculo, promediar } from '../../features/asistencia/rostro'
import CirculoRostro, { MENSAJE_CIRCULO } from '../../features/asistencia/CirculoRostro'

// Pantalla de la tablet de la entrada (pantalla completa, sin login).
// Solo funciona dentro del túnel WireGuard: fuera de él el backend responde 403.
//
// Flujo: un círculo indica dónde poner la cara. Con la cara dentro del círculo y cerca,
// el borde se llena mientras toma 5 lecturas seguidas (~1 s) → envía el promedio → resultado.
// Si la cara sale del círculo, la barra vuelve a cero.
// Sin prueba de parpadeo (decisión del negocio): solo la tablet de la oficina puede marcar
// y el jefe ve cada marcación.

const INTERVALO_MS = 200
const RESULTADO_MS = 5000
const CAPTURAS = 5

const formatoHora = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })

export default function KioscoAsistenciaPage() {
  const video = useRef(null)
  const stream = useRef(null)
  const estado = useRef({ fase: 'buscando', capturas: [] })
  const [fase, setFase] = useState('verificando') // verificando | no-autorizado | cargando | buscando | enviando | resultado | no-reconocido | error
  const [guia, setGuia] = useState('sin-cara')    // posición de la cara respecto al círculo
  const [progreso, setProgreso] = useState(0)
  const [mensaje, setMensaje] = useState('')
  const [resultado, setResultado] = useState(null)
  const [reloj, setReloj] = useState(new Date())

  const irA = useCallback((f) => { estado.current = { ...estado.current, fase: f }; setFase(f) }, [])
  const reiniciar = useCallback(() => {
    estado.current = { fase: 'buscando', capturas: [] }
    setFase('buscando'); setGuia('sin-cara'); setProgreso(0)
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
    setGuia('listo')
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
      if (s.fase === 'buscando') {
        const cara = await detectar(video.current).catch(() => null)
        const pos = posicionEnCirculo(cara && cara.score >= 0.6 ? cara : null)
        setGuia(pos)
        if (pos !== 'ok') {
          if (s.capturas.length) { s.capturas = []; setProgreso(0) }   // salió del círculo: barra a cero
        } else {
          s.capturas.push(Array.from(cara.descriptor))
          setProgreso(s.capturas.length / CAPTURAS)
          if (s.capturas.length >= CAPTURAS) enviar(s.capturas)
        }
      }
      if (vivo) setTimeout(paso, INTERVALO_MS)
    }
    paso()
    return () => { vivo = false }
  }, [enviar])

  const esEntrada = resultado?.tipo === 'ENTRADA'
  const conCamara = ['buscando', 'enviando'].includes(fase)

  return (
    <div className="fixed inset-0 bg-slate-950 text-white select-none overflow-hidden">
      <video ref={video} playsInline muted
        className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity ${conCamara ? 'opacity-100' : 'opacity-0'}`} />

      {/* Círculo guía en el centro exacto de la pantalla (= centro del cuadro de la cámara) */}
      {conCamara && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CirculoRostro estado={guia} progreso={progreso} className="w-[min(72vw,56vh)]" />
        </div>
      )}

      {/* Reloj arriba */}
      <div className="absolute top-0 inset-x-0 z-10 text-center pt-[4vh] drop-shadow-lg">
        <p className="text-5xl sm:text-6xl font-bold tabular-nums">{reloj.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}</p>
        <p className="text-lg opacity-85 first-letter:uppercase">{reloj.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Indicación debajo del círculo */}
      {conCamara && (
        <div className="absolute bottom-0 inset-x-0 z-10 text-center pb-[7vh] px-6">
          <p className="text-3xl sm:text-4xl font-bold drop-shadow-lg">{MENSAJE_CIRCULO[guia]}</p>
          {guia === 'sin-cara' && <p className="text-lg opacity-80 mt-2">para marcar tu entrada o salida</p>}
        </div>
      )}

      {/* Mensajes y resultado, centrados */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none">
        <div className="text-center max-w-xl pointer-events-auto">
          {fase === 'verificando' && <p className="text-2xl">Conectando…</p>}
          {fase === 'cargando' && <p className="text-2xl">Preparando el reconocimiento facial…</p>}

          {fase === 'resultado' && resultado && (
            <div className={`rounded-3xl p-8 shadow-2xl ${esEntrada ? 'bg-emerald-600' : 'bg-sky-600'}`}>
              <p className="text-4xl font-bold">{esEntrada ? '¡Hola' : '¡Hasta luego'}, {resultado.nombre.split(' ')[0]}!</p>
              <p className="text-2xl mt-3">{esEntrada ? 'Entrada' : 'Salida'} registrada a las {formatoHora(resultado.fechaHora)}</p>
              {resultado.repetida && <p className="mt-3 opacity-90">Ya habías marcado hace un momento.</p>}
              {resultado.tarde && !resultado.repetida && <p className="mt-3 font-semibold bg-amber-500/90 rounded-xl py-2">Llegada tarde</p>}
            </div>
          )}
          {fase === 'no-reconocido' && <div className="rounded-3xl p-8 bg-rose-600 text-xl shadow-2xl">{mensaje}</div>}
          {['no-autorizado', 'error'].includes(fase) && (
            <div className="rounded-3xl p-8 bg-rose-700 text-xl shadow-2xl">
              {mensaje}
              <button onClick={() => window.location.reload()} className="block mx-auto mt-5 px-6 py-3 rounded-xl bg-white text-rose-700 font-bold">Reintentar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
