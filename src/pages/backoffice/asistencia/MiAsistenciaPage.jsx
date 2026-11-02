import { useCallback, useEffect, useState } from 'react'
import { FaCamera, FaCheckCircle, FaClock, FaTrash } from 'react-icons/fa'
import { asistenciaService } from '../../../services/api/asistenciaService'
import RegistrarRostroModal from './RegistrarRostroModal'
import MarcarAsistenciaModal from './MarcarAsistenciaModal'

// "Mi asistencia" del vendedor (rol EMPLEADO):
//   1. Registra SU rostro (él mismo da la autorización).
//   2. Marca entrada/salida en un popup (en la tablet de la empresa).
//   3. Ve su historial: una entrada y una salida por día (últimos 30 días).
// El jefe ve la hora de entrada y salida en Backoffice → Asistencia.

const hora = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })
const dia = (iso) => new Date(iso).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
const hoyISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
const duracion = (a, b) => { const m = Math.round((new Date(b) - new Date(a)) / 60000); return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min` }

export default function MiAsistenciaPage() {
  const [datos, setDatos] = useState(null)
  const [registrando, setRegistrando] = useState(false)
  const [marcando, setMarcando] = useState(false)
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
  // Historial: un renglón por día con su entrada y su salida (la más reciente primero)
  const porDia = Object.entries((datos?.marcaciones || []).reduce((acc, m) => {
    const k = m.fechaHora.slice(0, 10)
    acc[k] ||= {}
    if (m.tipo === 'ENTRADA') acc[k].entrada ??= m.fechaHora
    else acc[k].salida = m.fechaHora
    return acc
  }, {})).sort(([a], [b]) => b.localeCompare(a))
  const hoy = Object.fromEntries(porDia)[hoyISO()] || {}
  const jornadaCompleta = Boolean(hoy.entrada && hoy.salida)

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
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--tx-3)' }}>2 · Hoy</p>
            <div className="flex gap-6 text-sm" style={{ color: 'var(--tx-2)' }}>
              <p>Entrada: <strong style={{ color: 'var(--tx-1)' }}>{hoy.entrada ? hora(hoy.entrada) : '—'}</strong></p>
              <p>Salida: <strong style={{ color: 'var(--tx-1)' }}>{hoy.salida ? hora(hoy.salida) : '—'}</strong></p>
            </div>
            {jornadaCompleta ? (
              <p className="flex items-center gap-2 mt-4 text-sm font-semibold text-green-600 dark:text-green-400">
                <FaCheckCircle /> Jornada de hoy completa. Mañana podrás marcar de nuevo.
              </p>
            ) : (
              <>
                <button onClick={() => setMarcando(true)} disabled={!t.tieneRostro || !t.activo}
                  className="btn-primary text-sm gap-2 mt-4 disabled:opacity-50">
                  <FaClock size={12} /> {hoy.entrada ? 'Marcar salida' : 'Marcar entrada'}
                </button>
                <p className="text-xs mt-2" style={{ color: 'var(--tx-3)' }}>Pon tu cara en el círculo. Solo funciona en la tablet de la empresa.</p>
              </>
            )}
          </div>
        </div>
      )}

      {t && (
        <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--tx-3)' }}>Mi historial (últimos 30 días)</p>
          {porDia.length === 0 && <p className="text-sm" style={{ color: 'var(--tx-3)' }}>Todavía no tienes marcaciones.</p>}
          {porDia.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--tx-3)' }}>
                  {['Día', 'Entrada', 'Salida', 'Horas'].map((h) => <th key={h} className="text-left text-xs font-bold uppercase tracking-wider pb-2">{h}</th>)}
                </tr>
              </thead>
              <tbody style={{ color: 'var(--tx-2)' }}>
                {porDia.map(([fecha, d]) => (
                  <tr key={fecha} style={{ borderTop: '1px solid var(--bd-1)' }}>
                    <td className="py-2 font-semibold first-letter:uppercase" style={{ color: 'var(--tx-1)' }}>{dia(`${fecha}T12:00:00`)}</td>
                    <td className="py-2">{d.entrada ? hora(d.entrada) : '—'}</td>
                    <td className="py-2">{d.salida ? hora(d.salida) : (fecha === hoyISO() ? 'Trabajando' : '—')}</td>
                    <td className="py-2">{d.entrada && d.salida ? duracion(d.entrada, d.salida) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {registrando && t && (
        <RegistrarRostroModal propio trabajador={t} onClose={() => setRegistrando(false)}
          onGuardar={(descriptor, consentimiento) => asistenciaService.registrarMiRostro(descriptor, consentimiento)}
          onListo={cargar} />
      )}

      {marcando && <MarcarAsistenciaModal onClose={() => setMarcando(false)} onMarcado={cargar} />}
    </div>
  )
}
