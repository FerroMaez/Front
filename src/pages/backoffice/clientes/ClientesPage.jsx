import { useState, useEffect, useCallback } from 'react'
import { FaSearch, FaSyncAlt, FaPhone, FaEnvelope, FaIdCard, FaMapMarkerAlt } from 'react-icons/fa'
import { clienteService } from '../../../services/api/clienteService'
import { formatCOP, formatDateTime } from '../../../utils/formatters'
import Modal from '../../../components/ui/Modal'

const normalizar = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const etiquetaMetodo = (m) => (m === 'TRANSFERENCIA' ? 'Transferencia' : m === 'EFECTIVO' ? 'Efectivo' : null)
const ESTADO = { VENTA_EXITOSA: 'Venta exitosa', CANCELADA: 'Cancelada', PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso' }

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState('')
  const [buscar,   setBuscar]   = useState('')
  const [elegido,  setElegido]  = useState(null)
  const [compras,  setCompras]  = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true); setError('')
    try { setClientes(await clienteService.historial()) }
    catch (err) { setError(err.response?.data?.error || 'No se pudieron cargar los clientes.') }
    finally { setCargando(false) }
  }, [])
  useEffect(() => { cargar() }, [cargar])

  const abrir = async (c) => {
    setElegido(c); setCompras(null)
    try { setCompras(await clienteService.compras(c.id)) } catch { setCompras([]) }
  }

  const texto = normalizar(buscar)
  const visibles = clientes
    .filter(c => !texto || normalizar(`${c.nombre} ${c.cedula} ${c.nit} ${c.telefono} ${c.email}`).includes(texto))
    .sort((a, b) => (b.ultima_compra || '').localeCompare(a.ultima_compra || ''))

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Histórico de clientes</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--tx-3)' }}>
            Los clientes que se guardan en cada venta. Haz clic en uno para ver todas sus compras.
          </p>
        </div>
        <button onClick={cargar} disabled={cargando}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors hover:bg-brand-500/10 disabled:opacity-50"
          style={{ color: 'var(--tx-2)', borderColor: 'var(--bd-1)' }}>
          <FaSyncAlt size={11} className={cargando ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <div className="relative mb-4 sm:w-96">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={12} style={{ color: 'var(--tx-3)' }} />
        <input type="search" value={buscar} onChange={e => setBuscar(e.target.value)} aria-label="Buscar cliente"
          placeholder="Buscar por nombre, cédula, NIT, teléfono o correo…"
          className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
      </div>
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="rounded-2xl overflow-x-auto" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider" style={{ color: 'var(--tx-3)', borderBottom: '1px solid var(--bd-1)' }}>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3 text-right">Compras</th>
              <th className="px-4 py-3 text-right">Total pagado</th>
              <th className="px-4 py-3 text-right">Debe</th>
              <th className="px-4 py-3">Última compra</th>
            </tr>
          </thead>
          <tbody>
            {!cargando && visibles.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10" style={{ color: 'var(--tx-3)' }}>No hay clientes que coincidan.</td></tr>
            )}
            {visibles.map(c => (
              <tr key={c.id} onClick={() => abrir(c)} onKeyDown={e => { if (e.key === 'Enter') abrir(c) }} tabIndex={0}
                className="cursor-pointer hover:bg-brand-500/5 transition-colors" style={{ borderTop: '1px solid var(--bd-1)', color: 'var(--tx-2)' }}>
                <td className="px-4 py-3">
                  <span className="font-semibold" style={{ color: 'var(--tx-1)' }}>{c.nombre}</span>
                  <span className="block text-[11px]" style={{ color: 'var(--tx-3)' }}>
                    {[c.cedula && `C.C. ${c.cedula}`, c.nit && `NIT ${c.nit}`].filter(Boolean).join(' · ') || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{[c.telefono, c.email].filter(Boolean).join(' · ') || '—'}</td>
                <td className="px-4 py-3 text-right">{c.compras}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap font-semibold" style={{ color: 'var(--tx-1)' }}>{formatCOP(c.total_pagado)}</td>
                <td className={`px-4 py-3 text-right whitespace-nowrap font-bold ${c.deuda > 0 ? 'text-red-500' : ''}`} style={c.deuda > 0 ? undefined : { color: 'var(--tx-3)' }}>
                  {c.deuda > 0 ? formatCOP(c.deuda) : '—'}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">{c.ultima_compra ? formatDateTime(c.ultima_compra) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!elegido} onClose={() => setElegido(null)} title={elegido?.nombre || ''} size="xl">
        {elegido && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4" style={{ color: 'var(--tx-2)' }}>
              {elegido.cedula && <p className="flex items-center gap-2"><FaIdCard size={11} className="text-brand-500" /> C.C. {elegido.cedula}</p>}
              {elegido.nit && <p className="flex items-center gap-2"><FaIdCard size={11} className="text-brand-500" /> NIT {elegido.nit}</p>}
              {elegido.telefono && <p className="flex items-center gap-2"><FaPhone size={11} className="text-brand-500" /> {elegido.telefono}</p>}
              {elegido.email && <p className="flex items-center gap-2"><FaEnvelope size={11} className="text-brand-500" /> {elegido.email}</p>}
              {elegido.direccion && <p className="flex items-center gap-2 sm:col-span-2"><FaMapMarkerAlt size={11} className="text-brand-500" /> {elegido.direccion}</p>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {[['Compras', elegido.compras], ['Valor productos', formatCOP(elegido.total_productos)],
                ['Total pagado', formatCOP(elegido.total_pagado)], ['Debe', elegido.deuda > 0 ? formatCOP(elegido.deuda) : '—']].map(([l, v]) => (
                <div key={l} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--tx-3)' }}>{l}</p>
                  <p className={`font-bold mt-0.5 ${l === 'Debe' && elegido.deuda > 0 ? 'text-red-500' : ''}`} style={l === 'Debe' && elegido.deuda > 0 ? undefined : { color: 'var(--tx-1)' }}>{v}</p>
                </div>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--tx-3)' }}>Todas sus compras</p>
            {compras === null && <p className="text-sm py-6 text-center" style={{ color: 'var(--tx-3)' }}>Cargando…</p>}
            {compras?.length === 0 && <p className="text-sm py-6 text-center" style={{ color: 'var(--tx-3)' }}>Este cliente aún no tiene compras.</p>}
            <div className="space-y-3">
              {compras?.map(o => (
                <div key={o.id} className="rounded-xl p-3" style={{ border: '1px solid var(--bd-1)', backgroundColor: 'var(--bg-surface)' }}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                    <span style={{ color: 'var(--tx-2)' }}>
                      <span className="font-mono font-bold text-brand-600 dark:text-brand-300">#{o.id}</span>
                      <span className="ml-2">{formatDateTime(o.fecha_creacion)}</span>
                      <span className="ml-2" style={{ color: 'var(--tx-3)' }}>· {ESTADO[o.estado] || o.estado}</span>
                    </span>
                    <span style={{ color: 'var(--tx-3)' }}>
                      {[etiquetaMetodo(o.metodo_pago), o.recibido_por && `recibió ${o.recibido_por}`].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      {o.items.map((i, k) => (
                        <tr key={k} style={{ color: 'var(--tx-2)' }}>
                          <td className="py-0.5">{i.nombre}{i.pulgadas ? ` ${i.pulgadas}` : ''}
                            {i.tipo_precio && <span className="ml-1.5 text-[10px] uppercase" style={{ color: 'var(--tx-3)' }}>· {i.tipo_precio === 'PESADO' ? 'Pesado' : 'Económico'}</span>}
                          </td>
                          <td className="py-0.5 text-right whitespace-nowrap">{i.cantidad} × {formatCOP(i.precio_unitario_momento)}</td>
                          <td className="py-0.5 text-right whitespace-nowrap font-semibold w-28">{formatCOP(i.precio_unitario_momento * i.cantidad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-2 pt-2 flex flex-wrap justify-end gap-x-5 gap-y-1 text-xs" style={{ borderTop: '1px solid var(--bd-1)', color: 'var(--tx-2)' }}>
                    <span>Total <strong style={{ color: 'var(--tx-1)' }}>{formatCOP(o.total_cotizacion)}</strong></span>
                    <span>Pagado <strong style={{ color: 'var(--tx-1)' }}>{formatCOP(o.total_pagado ?? o.total_cotizacion)}</strong></span>
                    {o.monto_deuda > 0 && (
                      <span>Debía {formatCOP(o.monto_deuda)} · Saldo <strong className={o.saldo_deuda > 0 ? 'text-red-500' : 'text-green-600'}>{o.saldo_deuda > 0 ? formatCOP(o.saldo_deuda) : 'Pagado'}</strong></span>
                    )}
                  </div>
                  {o.abonos.length > 0 && (
                    <ul className="mt-1.5 text-[11px] space-y-0.5 text-right" style={{ color: 'var(--tx-3)' }}>
                      {o.abonos.map(a => (
                        <li key={a.id}>Abonó <span className="text-green-600 dark:text-green-400 font-semibold">{formatCOP(a.monto)}</span> · {formatDateTime(a.fecha)} · {etiquetaMetodo(a.metodo_pago)} · recibió {a.recibido_por}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
