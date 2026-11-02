import { useEffect, useState } from 'react'
import { asistenciaService } from '../../services/api/asistenciaService'
import { useCapturaRostro } from '../../features/asistencia/useCapturaRostro'
import CirculoRostro, { MENSAJE_CIRCULO } from '../../features/asistencia/CirculoRostro'

// Pantalla completa de marcación (sin login) para una tablet compartida en la entrada.
// Solo funciona dentro del túnel WireGuard: fuera de él el backend responde 403.
// El vendedor también puede marcar desde "Mi asistencia" con un popup (MarcarAsistenciaModal).
//
// Un círculo indica dónde poner la cara; el borde se llena con 5 lecturas seguidas y marca.
// Sin prueba de parpadeo (decisión del negocio).

const RESULTADO_MS = 5000
const formatoHora = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })

export default function KioscoAsistenciaPage() {
  const [red, setRed] = useState('verificando') // verificando | ok | fuera
  const [resultado, setResultado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [reloj, setReloj] = useState(new Date())

  useEffect(() => { const t = setInterval(() => setReloj(new Date()), 1000); return () => clearInterval(t) }, [])

  // Mantener la pantalla encendida mientras la página esté abierta
  useEffect(() => {
    let lock = null
    const pedir = () => navigator.wakeLock?.request('screen').then((l) => { lock = l }).catch(() => {})
    pedir()
    document.addEventListener('visibilitychange', pedir)
    return () => { document.removeEventListener('visibilitychange', pedir); lock?.release().catch(() => {}) }
  }, [])

  useEffect(() => {
    asistenciaService.estadoKiosco().then(() => setRed('ok')).catch((e) => {
      setRed('fuera')
      setMensaje(e.response?.status === 403
        ? 'Este equipo no está conectado a la red de la empresa. Activa WireGuard y recarga.'
        : 'No hay conexión con el servidor. Revisa internet y WireGuard.')
    })
  }, [])

  const camara = useCapturaRostro({
    habilitado: red === 'ok',
    onCompleto: async (huella) => {
      setEnviando(true)
      try {
        setResultado(await asistenciaService.marcar(huella))
        setMensaje('')
      } catch (e) {
        setResultado(null)
        setMensaje(e.response?.data?.error || 'No se pudo registrar. Inténtalo de nuevo.')
      }
      setEnviando(false)
      setTimeout(() => { setResultado(null); setMensaje(''); camara.reiniciar() }, RESULTADO_MS)
    },
  })

  const esEntrada = resultado?.tipo === 'ENTRADA'
  const mostrandoCamara = red === 'ok' && camara.estado === 'listo' && !resultado && !mensaje

  return (
    <div className="fixed inset-0 bg-slate-950 text-white select-none overflow-hidden">
      <video ref={camara.video} playsInline muted
        className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity ${mostrandoCamara ? 'opacity-100' : 'opacity-0'}`} />

      {mostrandoCamara && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CirculoRostro estado={camara.guia} progreso={camara.progreso} className="w-[min(72vw,56vh)]" />
        </div>
      )}

      <div className="absolute top-0 inset-x-0 z-10 text-center pt-[4vh] drop-shadow-lg">
        <p className="text-5xl sm:text-6xl font-bold tabular-nums">{reloj.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}</p>
        <p className="text-lg opacity-85 first-letter:uppercase">{reloj.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {mostrandoCamara && (
        <div className="absolute bottom-0 inset-x-0 z-10 text-center pb-[7vh] px-6">
          <p className="text-3xl sm:text-4xl font-bold drop-shadow-lg">{enviando ? 'Verificando…' : MENSAJE_CIRCULO[camara.guia]}</p>
          {camara.guia === 'sin-cara' && <p className="text-lg opacity-80 mt-2">para marcar tu entrada o salida</p>}
        </div>
      )}

      <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none">
        <div className="text-center max-w-xl pointer-events-auto">
          {(red === 'verificando' || (red === 'ok' && camara.estado === 'cargando')) && <p className="text-2xl">Preparando el reconocimiento facial…</p>}
          {resultado && (
            <div className={`rounded-3xl p-8 shadow-2xl ${esEntrada ? 'bg-emerald-600' : 'bg-sky-600'}`}>
              <p className="text-4xl font-bold">{esEntrada ? '¡Hola' : '¡Hasta luego'}, {resultado.nombre.split(' ')[0]}!</p>
              <p className="text-2xl mt-3">{esEntrada ? 'Entrada' : 'Salida'} registrada a las {formatoHora(resultado.fechaHora)}</p>
              {resultado.repetida && <p className="mt-3 opacity-90">Ya habías marcado hace un momento.</p>}
              {resultado.tarde && !resultado.repetida && <p className="mt-3 font-semibold bg-amber-500/90 rounded-xl py-2">Llegada tarde</p>}
            </div>
          )}
          {red === 'ok' && mensaje && <div className="rounded-3xl p-8 bg-rose-600 text-xl shadow-2xl">{mensaje}</div>}
          {(red === 'fuera' || camara.estado === 'error') && (
            <div className="rounded-3xl p-8 bg-rose-700 text-xl shadow-2xl">
              {red === 'fuera' ? mensaje : 'No se pudo abrir la cámara. Revisa los permisos del navegador.'}
              <button onClick={() => window.location.reload()} className="block mx-auto mt-5 px-6 py-3 rounded-xl bg-white text-rose-700 font-bold">Reintentar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
