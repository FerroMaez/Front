import { useCallback, useEffect, useState } from 'react'
import { FaUserPlus, FaCamera, FaTrash, FaUserSlash, FaUserCheck } from 'react-icons/fa'
import { asistenciaService } from '../../../services/api/asistenciaService'
import { websocketService } from '../../../services/api/websocketService'
import RegistrarRostroModal from './RegistrarRostroModal'

const hoyISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }) // yyyy-mm-dd
const hora = (iso) => (iso ? new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }) : '—')
const fecha = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
const horas = (min) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`

function Etiqueta({ color, children }) {
  const c = {
    verde: 'bg-green-500/10 border-green-500/25 text-green-600 dark:text-green-400',
    ambar: 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400',
    rojo: 'bg-red-500/10 border-red-500/25 text-red-500',
    azul: 'bg-sky-500/10 border-sky-500/25 text-sky-600 dark:text-sky-400',
  }[color]
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${c}`}>{children}</span>
}

export default function AsistenciaPage() {
  const [pestana, setPestana] = useState('resumen')
  const [desde, setDesde] = useState(hoyISO())
  const [hasta, setHasta] = useState(hoyISO())
  const [dias, setDias] = useState([])
  const [trabajadores, setTrabajadores] = useState([])
  const [nuevo, setNuevo] = useState({ nombre: '', documento: '' })
  const [registrando, setRegistrando] = useState(null)
  const [toast, setToast] = useState('')

  const aviso = (m) => { setToast(m); setTimeout(() => setToast(''), 3500) }

  const cargar = useCallback(async () => {
    try {
      const [r, t] = await Promise.all([asistenciaService.reporte(desde, hasta), asistenciaService.trabajadores()])
      setDias(r); setTrabajadores(t)
    } catch (e) { aviso(e.response?.data?.error || 'No se pudo cargar la asistencia.') }
  }, [desde, hasta])

  useEffect(() => { cargar() }, [cargar])
  // Tiempo real: cuando un vendedor marca, se actualiza solo
  useEffect(() => { websocketService.connect(); return websocketService.onAsistencia(cargar) }, [cargar])

  const esHoy = desde === hoyISO() && hasta === hoyISO()
  const conMarcacionHoy = new Set(dias.filter((d) => d.fecha === hoyISO()).map((d) => d.trabajadorId))
  const sinLlegar = esHoy ? trabajadores.filter((t) => t.activo && t.tieneRostro && !conMarcacionHoy.has(t.id)) : []

  const crear = async (e) => {
    e.preventDefault()
    if (!nuevo.nombre.trim()) return
    try {
      await asistenciaService.crearTrabajador(nuevo.nombre.trim(), nuevo.documento.trim())
      setNuevo({ nombre: '', documento: '' }); aviso('Trabajador agregado. Ahora registra su rostro.'); cargar()
    } catch (er) { aviso(er.response?.data?.error || 'No se pudo agregar.') }
  }
  const accion = async (fn, ok) => {
    try { await fn(); aviso(ok); cargar() } catch (e) { aviso(e.response?.data?.error || 'No se pudo completar la acción.') }
  }

  return (
    <div>
      {toast && <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-brand-600 shadow-lg">{toast}</div>}

      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Asistencia</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--tx-3)' }}>Entradas y salidas que los vendedores marcan con su rostro</p>
      </div>

      <div className="flex gap-2 mb-5">
        {[['resumen', 'Resumen'], ['trabajadores', `Trabajadores (${trabajadores.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setPestana(k)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border ${pestana === k ? 'bg-brand-600 text-white border-transparent' : ''}`}
            style={{ color: pestana === k ? undefined : 'var(--tx-2)', borderColor: pestana === k ? undefined : 'var(--bd-1)' }}>
            {l}
          </button>
        ))}
      </div>

      {pestana === 'resumen' && (
        <>
          <div className="flex flex-wrap items-end gap-3 mb-4">
            {[['Desde', desde, setDesde], ['Hasta', hasta, setHasta]].map(([l, v, set]) => (
              <label key={l} className="text-xs font-semibold" style={{ color: 'var(--tx-3)' }}>
                {l}
                <input type="date" value={v} max={hoyISO()} onChange={(e) => set(e.target.value)}
                  className="block mt-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
              </label>
            ))}
            {[
              ['Hoy', 0],
              ['Últimos 7 días', 6],
              ['Este mes', null],
            ].map(([l, dias]) => {
              const hoy = hoyISO()
              const inicio = dias === null ? `${hoy.slice(0, 8)}01` : new Date(Date.parse(`${hoy}T12:00:00`) - dias * 864e5).toISOString().slice(0, 10)
              const activo = desde === inicio && hasta === hoy
              return (
                <button key={l} onClick={() => { setDesde(inicio); setHasta(hoy) }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border ${activo ? 'bg-brand-600 text-white border-transparent' : ''}`}
                  style={{ color: activo ? undefined : 'var(--tx-2)', borderColor: activo ? undefined : 'var(--bd-1)' }}>
                  {l}
                </button>
              )
            })}
          </div>

          {sinLlegar.length > 0 && (
            <div className="mb-4 p-3 rounded-xl text-sm bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300">
              Aún no han marcado hoy: <strong>{sinLlegar.map((t) => t.nombre).join(', ')}</strong>
            </div>
          )}

          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--bd-1)' }}>
            <div className="overflow-x-auto">
              <table className="text-sm data-table w-full">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-surface)' }}>
                    {['Trabajador', 'Fecha', 'Entrada', 'Salida', 'Horas', 'Estado'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--tx-3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dias.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--tx-3)' }}>No hay marcaciones en estas fechas.</td></tr>
                  )}
                  {dias.map((d) => (
                    <tr key={`${d.trabajadorId}-${d.fecha}`}>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--tx-1)' }}>{d.nombre}</td>
                      <td className="px-4 py-3 first-letter:uppercase">{fecha(d.fecha)}</td>
                      <td className="px-4 py-3">{hora(d.primeraEntrada)}</td>
                      <td className="px-4 py-3">{hora(d.ultimaSalida)}</td>
                      <td className="px-4 py-3">{d.sinSalida && d.minutosTrabajados === 0 ? '—' : horas(d.minutosTrabajados)}</td>
                      <td className="px-4 py-3 space-x-1">
                        {d.tarde ? <Etiqueta color="ambar">Llegó tarde</Etiqueta> : <Etiqueta color="verde">A tiempo</Etiqueta>}
                        {d.sinSalida && <Etiqueta color="azul">{d.fecha === hoyISO() ? 'Trabajando' : 'Sin salida'}</Etiqueta>}
                        {d.salidaTemprana && <Etiqueta color="rojo">Salió temprano</Etiqueta>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {pestana === 'trabajadores' && (
        <>
          <form onSubmit={crear} className="flex flex-wrap gap-3 mb-4">
            <input placeholder="Nombre completo" value={nuevo.nombre} maxLength={120}
              onChange={(e) => setNuevo((n) => ({ ...n, nombre: e.target.value }))}
              className="px-3 py-2.5 rounded-xl text-sm outline-none flex-1 min-w-48"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
            <input placeholder="Documento (opcional)" value={nuevo.documento} maxLength={30}
              onChange={(e) => setNuevo((n) => ({ ...n, documento: e.target.value }))}
              className="px-3 py-2.5 rounded-xl text-sm outline-none w-48"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
            <button type="submit" className="btn-primary text-sm gap-2"><FaUserPlus size={12} /> Agregar trabajador</button>
          </form>

          <div className="space-y-2">
            {trabajadores.length === 0 && <p className="text-sm py-6 text-center" style={{ color: 'var(--tx-3)' }}>Agrega a los trabajadores que marcarán asistencia.</p>}
            {trabajadores.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 flex-wrap p-4 rounded-2xl"
                style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)', opacity: t.activo ? 1 : 0.6 }}>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--tx-1)' }}>{t.nombre} {t.documento && <span className="text-xs font-normal" style={{ color: 'var(--tx-3)' }}>· {t.documento}</span>}</p>
                  <div className="mt-1 space-x-1">
                    {t.vendedor && <Etiqueta color="azul">Vendedor</Etiqueta>}
                    {!t.activo ? <Etiqueta color="rojo">Inactivo</Etiqueta>
                      : t.tieneRostro ? <Etiqueta color="verde">Rostro registrado</Etiqueta>
                        : <Etiqueta color="ambar">{t.vendedor ? 'Debe registrar su rostro desde su cuenta' : 'Falta registrar el rostro'}</Etiqueta>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {t.activo && !t.vendedor && (
                    <button onClick={() => setRegistrando(t)} className="btn-outline text-xs gap-1.5">
                      <FaCamera size={11} /> {t.tieneRostro ? 'Volver a registrar' : 'Registrar rostro'}
                    </button>
                  )}
                  {t.tieneRostro && (
                    <button onClick={() => confirm(`¿Borrar la huella facial de ${t.nombre}? No podrá marcar hasta registrarla de nuevo.`)
                        && accion(() => asistenciaService.borrarRostro(t.id), 'Huella facial borrada.')}
                      className="btn-outline text-xs gap-1.5 text-red-500"><FaTrash size={10} /> Borrar rostro</button>
                  )}
                  <button onClick={() => (!t.activo || confirm(`¿Desactivar a ${t.nombre}? Se borrará su huella facial.`))
                      && accion(() => asistenciaService.cambiarActivo(t.id, !t.activo), t.activo ? 'Trabajador desactivado.' : 'Trabajador activado.')}
                    className="btn-outline text-xs gap-1.5">
                    {t.activo ? <><FaUserSlash size={11} /> Desactivar</> : <><FaUserCheck size={11} /> Activar</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {registrando && (
        <RegistrarRostroModal trabajador={registrando} onClose={() => setRegistrando(null)}
          onGuardar={(descriptor, consentimiento) => asistenciaService.registrarRostro(registrando.id, descriptor, consentimiento)}
          onListo={cargar} />
      )}
    </div>
  )
}
