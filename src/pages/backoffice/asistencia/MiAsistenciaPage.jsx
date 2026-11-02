import { useCallback, useEffect, useState } from 'react'
import { FaCamera, FaCheckCircle, FaExternalLinkAlt, FaTrash } from 'react-icons/fa'
import { asistenciaService } from '../../../services/api/asistenciaService'
import RegistrarRostroModal from './RegistrarRostroModal'

// "Mi asistencia" del vendedor (rol EMPLEADO):
//   1. Registra SU rostro (él mismo da la autorización).
//   2. Abre la pantalla de marcación en la tablet de la entrada.
//   3. Ve sus marcaciones de los últimos 7 días.
// El jefe ve la hora de entrada y salida en Backoffice → Asistencia.

const hora = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })
const dia = (iso) => new Date(iso).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

export default function MiAsistenciaPage() {
  const [datos, setDatos] = useState(null)
  const [registrando, setRegistrando] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const aviso = (m) => { setToast(m); setTimeout(() => setToast(''), 3500) }
  const cargar = useCallback(async () => {
    try { setDatos(await asistenciaService.miAsistencia()); setError('') }
    catch (e) { setError(e.response?.data?.error || 'No se pudo cargar tu asistencia.') }
  }, [])
  useEffect(() => { cargar() }, [cargar])

  const t = datos?.trabajador
  // Agrupa las marcaciones por día (la más reciente primero)
  const porDia = Object.entries((datos?.marcaciones || []).reduce((acc, m) => {
    const k = m.fechaHora.slice(0, 10); (acc[k] ||= []).push(m); return acc
  }, {})).sort(([a], [b]) => b.localeCompare(a))

  return (
    <div className="max-w-3xl">
      {toast && <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-brand-600 shadow-lg">{toast}</div>}

      <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Mi asistencia</h1>
      <p className="text-sm mt-0.5 mb-6" style={{ color: 'var(--tx-3)' }}>Registra tu rostro una vez y marca tu entrada y salida en la tablet de la entrada.</p>

      {error && <p className="mb-4 p-3 rounded-xl text-sm text-red-500 bg-red-500/10 border border-red-500/20">{error}</p>}

      {t && (
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {/* Paso 1 */}
          <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--tx-3)' }}>1 · Mi rostro</p>
            {!t.activo ? (
              <p className="text-sm text-red-500">Tu registro de asistencia está desactivado. Habla con tu jefe.</p>
            ) : t.tieneRostro ? (
              <>
                <p className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                  <FaCheckCircle /> Registrado el {new Date(t.rostroRegistradoEn).toLocaleDateString('es-CO')}
                </p>
                <div className="flex gap-2 mt-4 flex-wrap">
                  <button onClick={() => setRegistrando(true)} className="btn-outline text-xs gap-1.5"><FaCamera size={11} /> Volver a registrar</button>
                  <button onClick={async () => {
                    if (!confirm('¿Borrar tu huella facial? No podrás marcar hasta registrarla de nuevo.')) return
                    try { await asistenciaService.borrarMiRostro(); aviso('Tu huella facial fue borrada.'); cargar() }
                    catch (e) { aviso(e.response?.data?.error || 'No se pudo borrar.') }
                  }} className="btn-outline text-xs gap-1.5 text-red-500"><FaTrash size={10} /> Borrar</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm" style={{ color: 'var(--tx-2)' }}>Aún no has registrado tu rostro. Se hace una sola vez y no se guardan fotos.</p>
                <button onClick={() => setRegistrando(true)} className="btn-primary text-sm gap-2 mt-4"><FaCamera size={12} /> Registrar mi rostro</button>
              </>
            )}
          </div>

          {/* Paso 2 */}
          <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)', opacity: t.tieneRostro ? 1 : 0.6 }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--tx-3)' }}>2 · Marcar entrada / salida</p>
            <p className="text-sm" style={{ color: 'var(--tx-2)' }}>
              En la tablet de la entrada: abre la pantalla de marcación y mira a la cámara un segundo.
              Solo funciona en la tablet de la empresa.
            </p>
            <a href="/asistencia/kiosco" target="_blank" rel="noreferrer"
              className={`btn-primary text-sm gap-2 mt-4 inline-flex ${t.tieneRostro ? '' : 'pointer-events-none'}`}
              aria-disabled={!t.tieneRostro}>
              <FaExternalLinkAlt size={11} /> Abrir pantalla de marcación
            </a>
          </div>
        </div>
      )}

      {t && (
        <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--tx-3)' }}>Mis marcaciones (últimos 7 días)</p>
          {porDia.length === 0 && <p className="text-sm" style={{ color: 'var(--tx-3)' }}>Todavía no tienes marcaciones.</p>}
          <ul className="space-y-3">
            {porDia.map(([fecha, lista]) => (
              <li key={fecha}>
                <p className="text-sm font-semibold first-letter:uppercase" style={{ color: 'var(--tx-1)' }}>{dia(lista[0].fechaHora)}</p>
                <p className="text-sm" style={{ color: 'var(--tx-2)' }}>
                  {lista.map((m) => `${m.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'} ${hora(m.fechaHora)}`).join('  ·  ')}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {registrando && t && (
        <RegistrarRostroModal propio trabajador={t} onClose={() => setRegistrando(false)}
          onGuardar={async (descriptor, consentimiento) => {
            await asistenciaService.registrarMiRostro(descriptor, consentimiento)
            setRegistrando(false); aviso('¡Listo! Tu rostro quedó registrado.'); cargar()
          }} />
      )}
    </div>
  )
}
