import { useState, useEffect, useCallback } from 'react'
import { FaSearch, FaSyncAlt, FaUndo } from 'react-icons/fa'
import { movimientoService } from '../../../services/api/movimientoService'
import { formatDateTime } from '../../../utils/formatters'
import Modal from '../../../components/ui/Modal'

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const hoy = () => iso(new Date())
const haceDias = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d) }
const normalizar = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const TIPOS = {
  PRODUCTO_CREADO:      { label: 'Producto creado',      clase: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25' },
  PRODUCTO_EDITADO:     { label: 'Producto editado',     clase: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/25' },
  STOCK_AGREGADO:       { label: 'Unidades sumadas',     clase: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25' },
  PRODUCTO_ELIMINADO:   { label: 'Producto eliminado',   clase: 'bg-red-500/10 text-red-500 border-red-500/25' },
  BODEGA_A_ARREGLOS:    { label: 'Bodega → Arreglos',    clase: 'bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/25' },
  ARREGLO_A_INVENTARIO: { label: 'Arreglos → Inventario', clase: 'bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/25' },
  VENTA_FISICA:         { label: 'Venta física',         clase: 'bg-green-500/10 text-green-600 dark:text-green-300 border-green-500/25' },
  ABONO_DEUDA:          { label: 'Pago de deuda',        clase: 'bg-green-500/10 text-green-600 dark:text-green-300 border-green-500/25' },
  ORDEN_ESTADO:         { label: 'Estado de orden',      clase: 'bg-gray-500/10 border-gray-500/25' },
  ORDEN_FACTURADA:      { label: 'Orden facturada',      clase: 'bg-gray-500/10 border-gray-500/25' },
}
const QUE_HACE = {
  PRODUCTO_CREADO: 'El producto se quitará de la lista (queda inactivo).',
  PRODUCTO_EDITADO: 'El producto vuelve a quedar como estaba antes de esta edición.',
  STOCK_AGREGADO: 'Se restan las unidades que se sumaron.',
  PRODUCTO_ELIMINADO: 'El producto vuelve a aparecer en la lista.',
  BODEGA_A_ARREGLOS: 'Las unidades vuelven de Arreglos a Bodega.',
  ARREGLO_A_INVENTARIO: 'Las unidades vuelven del Inventario a Arreglos.',
  VENTA_FISICA: 'La venta queda anulada, el stock de sus productos se devuelve y su deuda se borra. Ya no cuenta en el Dashboard ni en Históricos.',
  ABONO_DEUDA: 'El pago se borra y el cliente vuelve a deber ese valor.',
}

export default function MovimientosPage() {
  const [desde, setDesde] = useState(haceDias(6))
  const [hasta, setHasta] = useState(hoy())
  const [movs, setMovs] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [buscar, setBuscar] = useState('')
  const [tipo, setTipo] = useState('')
  const [usuario, setUsuario] = useState('')
  const [deshacer, setDeshacer] = useState(null)   // movimiento a deshacer
  const [motivo, setMotivo] = useState('')
  const [errDeshacer, setErrDeshacer] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [toast, setToast] = useState('')

  const cargar = useCallback(async (d, h) => {
    setCargando(true); setError('')
    try { setMovs(await movimientoService.listar({ desde: d, hasta: h })) }
    catch (err) { setError(err.response?.data?.error || 'No se pudieron cargar los movimientos.') }
    finally { setCargando(false) }
  }, [])
  useEffect(() => { cargar(haceDias(6), hoy()) }, [cargar])

  const usuarios = [...new Set(movs.map(m => m.usuario))].sort()
  const visibles = movs.filter(m => (!tipo || m.tipo === tipo) && (!usuario || m.usuario === usuario)
    && (!buscar.trim() || normalizar(`${m.descripcion} ${m.usuario}`).includes(normalizar(buscar))))

  const confirmarDeshacer = async () => {
    setProcesando(true); setErrDeshacer('')
    try {
      await movimientoService.revertir(deshacer.id, motivo)
      setToast('Operación deshecha.'); setTimeout(() => setToast(''), 4000)
      setDeshacer(null)
      await cargar(desde, hasta)
    } catch (err) {
      setErrDeshacer(err.response?.data?.error || 'No se pudo deshacer la operación.')
    } finally { setProcesando(false) }
  }

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg max-w-sm"
          style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>{toast}</div>
      )}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Movimientos</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--tx-3)' }}>
            Todo lo que hacen el jefe y los vendedores. Si algo quedó mal, se puede deshacer.
          </p>
        </div>
        <button onClick={() => cargar(desde, hasta)} disabled={cargando}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors hover:bg-brand-500/10 disabled:opacity-50"
          style={{ color: 'var(--tx-2)', borderColor: 'var(--bd-1)' }}>
          <FaSyncAlt size={11} className={cargando ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <div className="mb-4 p-4 rounded-2xl flex flex-wrap items-end gap-3" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
        {[['mov-desde', 'Desde', desde, setDesde], ['mov-hasta', 'Hasta', hasta, setHasta]].map(([id, label, valor, set]) => (
          <div key={id}>
            <label htmlFor={id} className="block text-xs font-semibold mb-1" style={{ color: 'var(--tx-3)' }}>{label}</label>
            <input id={id} type="date" value={valor} max={hoy()} onChange={e => set(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
          </div>
        ))}
        <button onClick={() => cargar(desde, hasta)} disabled={cargando}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-50">Consultar</button>
        <select value={tipo} onChange={e => setTipo(e.target.value)} aria-label="Tipo de operación"
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>
          <option value="">Todas las operaciones</option>
          {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={usuario} onChange={e => setUsuario(e.target.value)} aria-label="Usuario"
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>
          <option value="">Todos los usuarios</option>
          {usuarios.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={12} style={{ color: 'var(--tx-3)' }} />
          <input type="search" value={buscar} onChange={e => setBuscar(e.target.value)} aria-label="Buscar movimiento"
            placeholder="Buscar producto, cliente, orden…"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <p className="mb-2 text-xs" style={{ color: 'var(--tx-3)' }}>{visibles.length} movimiento(s)</p>

      <div className="rounded-2xl overflow-x-auto" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider" style={{ color: 'var(--tx-3)', borderBottom: '1px solid var(--bd-1)' }}>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Operación</th>
              <th className="px-4 py-3">Detalle</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {!cargando && visibles.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10" style={{ color: 'var(--tx-3)' }}>No hay movimientos en estas fechas.</td></tr>
            )}
            {visibles.map(m => {
              const t = TIPOS[m.tipo] || { label: m.tipo, clase: 'bg-gray-500/10 border-gray-500/25' }
              return (
                <tr key={m.id} className={m.revertido ? 'opacity-60' : ''} style={{ borderTop: '1px solid var(--bd-1)', color: 'var(--tx-2)' }}>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{formatDateTime(m.fecha)}</td>
                  <td className="px-4 py-3">
                    <span style={{ color: 'var(--tx-1)' }}>{m.usuario}</span>
                    {m.rol && <span className="block text-[10px] uppercase tracking-wide" style={{ color: 'var(--tx-3)' }}>{m.rol === 'JEFE' ? 'Jefe' : m.rol === 'EMPLEADO' ? 'Vendedor' : m.rol}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${t.clase}`} style={t.clase.includes('gray') ? { color: 'var(--tx-2)' } : undefined}>{t.label}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={m.revertido ? 'line-through' : ''}>{m.descripcion}</span>
                    {m.revertido && (
                      <span className="block mt-0.5 text-[11px] text-red-500 no-underline">
                        Deshecho {m.fecha_reversion ? formatDateTime(m.fecha_reversion) : ''}{m.revertido_por ? ` por ${m.revertido_por}` : ''}{m.motivo_reversion ? ` · ${m.motivo_reversion}` : ''}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.revertible ? (
                      <button onClick={() => { setDeshacer(m); setMotivo(''); setErrDeshacer('') }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/25 hover:bg-red-500/20 transition-colors">
                        <FaUndo size={10} /> Deshacer
                      </button>
                    ) : !m.revertido && <span className="text-[11px]" style={{ color: 'var(--tx-3)' }}>—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!deshacer} onClose={() => setDeshacer(null)} title="¿Deshacer esta operación?" size="md">
        {deshacer && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--bd-1)', color: 'var(--tx-2)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>{formatDateTime(deshacer.fecha)} · {deshacer.usuario}</p>
              {deshacer.descripcion}
            </div>
            <p className="text-sm" style={{ color: 'var(--tx-2)' }}><strong style={{ color: 'var(--tx-1)' }}>Qué pasará:</strong> {QUE_HACE[deshacer.tipo]}</p>
            <div>
              <label htmlFor="mov-motivo" className="block text-xs font-semibold mb-1" style={{ color: 'var(--tx-3)' }}>Motivo (opcional)</label>
              <input id="mov-motivo" value={motivo} maxLength={300} onChange={e => setMotivo(e.target.value)} placeholder="Ej: se registró dos veces"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
            </div>
            {errDeshacer && <p className="text-xs text-red-500">{errDeshacer}</p>}
            <div className="flex gap-3">
              <button onClick={confirmarDeshacer} disabled={procesando}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-60">
                {procesando ? 'Deshaciendo…' : 'Sí, deshacer'}
              </button>
              <button onClick={() => setDeshacer(null)} className="btn-outline flex-1 justify-center">Cancelar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
