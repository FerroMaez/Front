import { useState, useEffect, useCallback } from 'react'
import { FaSearch, FaSyncAlt, FaPhone, FaIdCard, FaMoneyBillWave } from 'react-icons/fa'
import { deudaService, cajeroService } from '../../../services/api/deudaService'
import { formatCOP, formatDateTime } from '../../../utils/formatters'
import Modal from '../../../components/ui/Modal'

const normalizar = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const METODOS = [['EFECTIVO', 'Efectivo'], ['TRANSFERENCIA', 'Transferencia']]
const etiquetaMetodo = (m) => (m === 'TRANSFERENCIA' ? 'Transferencia' : m === 'EFECTIVO' ? 'Efectivo' : '—')

/** Agrupa las órdenes con deuda por cliente (cliente guardado o, si no hay, por nombre). */
function agruparPorCliente(ordenes) {
  const grupos = new Map()
  for (const o of ordenes) {
    const clave = o.cliente_id ? `id-${o.cliente_id}` : `nombre-${normalizar(o.cliente?.nombre)}`
    if (!grupos.has(clave)) grupos.set(clave, { clave, cliente: o.cliente || {}, ordenes: [], saldo: 0 })
    const g = grupos.get(clave)
    g.ordenes.push(o)
    g.saldo += o.saldo_deuda
  }
  return [...grupos.values()].sort((a, b) => b.saldo - a.saldo)
}

export default function DeudoresPage() {
  const [ordenes,  setOrdenes]  = useState([])
  const [cajeros,  setCajeros]  = useState([])
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState('')
  const [buscar,   setBuscar]   = useState('')
  const [abono,    setAbono]    = useState(null)   // { orden, monto, metodoPago, recibidoPor }
  const [errAbono, setErrAbono] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [toast,    setToast]    = useState('')

  const cargar = useCallback(async () => {
    setCargando(true); setError('')
    try { setOrdenes(await deudaService.listar()) }
    catch (err) { setError(err.response?.data?.error || 'No se pudieron cargar los deudores.') }
    finally { setCargando(false) }
  }, [])

  useEffect(() => { cargar(); cajeroService.listar().then(setCajeros).catch(() => {}) }, [cargar])

  const grupos = agruparPorCliente(ordenes).filter(g => !buscar.trim()
    || normalizar(`${g.cliente.nombre} ${g.cliente.cedula || ''} ${g.cliente.nit || ''} ${g.cliente.telefono || ''}`).includes(normalizar(buscar)))
  const totalDeuda = ordenes.reduce((s, o) => s + o.saldo_deuda, 0)

  const abrirAbono = (orden) => {
    setErrAbono('')
    setAbono({ orden, monto: String(orden.saldo_deuda), metodoPago: '', recibidoPor: '' })
  }

  const guardarAbono = async () => {
    const monto = Number(abono.monto)
    if (!(monto > 0)) return setErrAbono('Ingresa cuánto pagó el cliente.')
    if (monto > abono.orden.saldo_deuda) return setErrAbono(`No puede ser mayor que lo que debe (${formatCOP(abono.orden.saldo_deuda)}).`)
    if (!abono.metodoPago) return setErrAbono('Elige si pagó en efectivo o por transferencia.')
    if (!abono.recibidoPor) return setErrAbono('Elige quién recibió el pago en caja.')
    setGuardando(true)
    try {
      await deudaService.abonar(abono.orden.id, { monto, metodoPago: abono.metodoPago, recibidoPor: abono.recibidoPor })
      setToast(monto === abono.orden.saldo_deuda ? `Orden #${abono.orden.id}: deuda saldada.` : `Pago de ${formatCOP(monto)} registrado en la orden #${abono.orden.id}.`)
      setTimeout(() => setToast(''), 4000)
      setAbono(null)
      await cargar()
    } catch (err) {
      setErrAbono(err.response?.data?.error || 'No se pudo registrar el pago.')
    } finally { setGuardando(false) }
  }

  return (
    <div>
      {toast && (
        <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg max-w-sm"
          style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>{toast}</div>
      )}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Deudores</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--tx-3)' }}>Clientes que quedaron debiendo en sus compras y cuánto deben</p>
        </div>
        <button onClick={cargar} disabled={cargando}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors hover:bg-brand-500/10 disabled:opacity-50"
          style={{ color: 'var(--tx-2)', borderColor: 'var(--bd-1)' }}>
          <FaSyncAlt size={11} className={cargando ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[['Total por cobrar', formatCOP(totalDeuda), '#ef4444'], ['Clientes que deben', agruparPorCliente(ordenes).length, 'var(--tx-1)'],
          ['Ventas con deuda', ordenes.length, 'var(--tx-1)']].map(([label, valor, color]) => (
          <div key={label} className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--tx-3)' }}>{label}</p>
            <p className="text-2xl font-bold mt-1.5" style={{ color }}>{valor}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4 sm:w-96">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={12} style={{ color: 'var(--tx-3)' }} />
        <input type="search" value={buscar} onChange={e => setBuscar(e.target.value)} aria-label="Buscar deudor"
          placeholder="Buscar por nombre, cédula, NIT o teléfono…"
          className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      {!cargando && grupos.length === 0 && (
        <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
          <p style={{ color: 'var(--tx-3)' }}>{ordenes.length ? 'Ningún deudor coincide con la búsqueda.' : 'Nadie debe nada. 🎉'}</p>
        </div>
      )}

      <div className="space-y-4">
        {grupos.map(g => (
          <div key={g.clave} className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
            <div className="p-4 flex flex-wrap items-start justify-between gap-3" style={{ borderBottom: '1px solid var(--bd-1)' }}>
              <div>
                <p className="font-bold" style={{ color: 'var(--tx-1)' }}>{g.cliente.nombre || 'Sin nombre'}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs" style={{ color: 'var(--tx-2)' }}>
                  {g.cliente.cedula && <span className="flex items-center gap-1"><FaIdCard size={10} /> C.C. {g.cliente.cedula}</span>}
                  {g.cliente.nit && <span className="flex items-center gap-1"><FaIdCard size={10} /> NIT {g.cliente.nit}</span>}
                  {g.cliente.telefono && <span className="flex items-center gap-1"><FaPhone size={10} /> {g.cliente.telefono}</span>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tx-3)' }}>Debe en total</p>
                <p className="text-xl font-bold text-red-500">{formatCOP(g.saldo)}</p>
                <p className="text-[10px]" style={{ color: 'var(--tx-3)' }}>{g.ordenes.length} venta(s)</p>
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--bd-1)' }}>
              {g.ordenes.map(o => (
                <div key={o.id} className="p-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3" style={{ borderColor: 'var(--bd-1)' }}>
                  <div className="text-xs space-y-1" style={{ color: 'var(--tx-2)' }}>
                    <p>
                      <span className="font-mono font-bold text-brand-600 dark:text-brand-300">#{o.id}</span>
                      <span className="ml-2">{formatDateTime(o.fecha_creacion)}</span>
                      <span className="ml-2" style={{ color: 'var(--tx-3)' }}>· Venta {formatCOP(o.total_cotizacion)} · Debía {formatCOP(o.monto_deuda)}</span>
                    </p>
                    <p style={{ color: 'var(--tx-3)' }}>
                      {o.items.map(i => `${i.nombre}${i.pulgadas ? ` ${i.pulgadas}` : ''} ×${i.cantidad}`).join(' · ')}
                    </p>
                    {o.abonos.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {o.abonos.map(a => (
                          <li key={a.id} className="flex flex-wrap gap-x-2">
                            <span className="text-green-600 dark:text-green-400 font-semibold">Abonó {formatCOP(a.monto)}</span>
                            <span style={{ color: 'var(--tx-3)' }}>{formatDateTime(a.fecha)} · {etiquetaMetodo(a.metodo_pago)} · recibió {a.recibido_por}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-2">
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tx-3)' }}>Saldo</p>
                      <p className="font-bold text-red-500">{formatCOP(o.saldo_deuda)}</p>
                    </div>
                    <button onClick={() => abrirAbono(o)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-green-500/15 text-green-600 dark:text-green-300 border border-green-500/25 hover:bg-green-500/25 transition-colors">
                      <FaMoneyBillWave size={11} /> Registrar pago
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!abono} onClose={() => setAbono(null)} title={abono ? `Registrar pago — Orden #${abono.orden.id}` : ''} size="md">
        {abono && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--tx-2)' }}>
              <strong style={{ color: 'var(--tx-1)' }}>{abono.orden.cliente?.nombre}</strong> debe <strong className="text-red-500">{formatCOP(abono.orden.saldo_deuda)}</strong> en esta venta.
            </p>
            <div>
              <label htmlFor="abono-monto" className="block text-xs font-semibold mb-1" style={{ color: 'var(--tx-3)' }}>¿Cuánto pagó? (COP)</label>
              <input id="abono-monto" type="number" min="1" value={abono.monto}
                onChange={e => { setAbono(a => ({ ...a, monto: e.target.value })); setErrAbono('') }}
                className="w-full px-3 py-2 rounded-xl text-sm font-bold outline-none"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
              <p className="mt-0.5 text-[11px]" style={{ color: 'var(--tx-3)' }}>Si paga todo, la deuda queda saldada. Si paga una parte, queda el resto.</p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--tx-3)' }}>Forma de pago</p>
              <div role="radiogroup" aria-label="Forma de pago" className="inline-flex rounded-xl overflow-hidden text-xs font-bold" style={{ border: '1px solid var(--bd-1)' }}>
                {METODOS.map(([valor, label]) => (
                  <button key={valor} type="button" role="radio" aria-checked={abono.metodoPago === valor}
                    onClick={() => { setAbono(a => ({ ...a, metodoPago: valor })); setErrAbono('') }}
                    className={`px-4 py-2 transition-colors ${abono.metodoPago === valor ? 'bg-brand-600 text-white' : 'hover:bg-brand-500/10'}`}
                    style={abono.metodoPago === valor ? undefined : { color: 'var(--tx-2)' }}>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="abono-cajero" className="block text-xs font-semibold mb-1" style={{ color: 'var(--tx-3)' }}>Recibió en caja</label>
              <select id="abono-cajero" value={abono.recibidoPor} onChange={e => { setAbono(a => ({ ...a, recibidoPor: e.target.value })); setErrAbono('') }}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>
                <option value="">Selecciona…</option>
                {cajeros.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {errAbono && <p className="text-xs text-red-500">{errAbono}</p>}
            <div className="flex gap-3">
              <button onClick={guardarAbono} disabled={guardando}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-60">
                {guardando ? 'Guardando…' : 'Registrar pago'}
              </button>
              <button onClick={() => setAbono(null)} className="btn-outline flex-1 justify-center">Cancelar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
