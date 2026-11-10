import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, ComposedChart, Line } from 'recharts'
import { FaShoppingCart, FaMoneyBillWave, FaHandHoldingUsd, FaExclamationTriangle, FaSync, FaSearch } from 'react-icons/fa'
import { dashboardService } from '../../../services/api/dashboardService'
import { formatCOP, formatDateTime } from '../../../utils/formatters'
import { CATEGORIA_LABEL } from '../../../features/catalog/mockProducts'
import StockBadge from '../../../components/shared/StockBadge'

const C = { efectivo: '#8C903B', transferencia: '#0ea5e9', sinDato: '#94a3b8', deuda: '#ef4444', ingresos: '#16a34a' }
const tooltipStyle = { backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)', borderRadius: 12, fontSize: 12, color: 'var(--tx-1)' }
const eje = { fontSize: 11, fill: 'var(--tx-3)' }

// Fechas locales en formato 'YYYY-MM-DD'
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const hoy = () => iso(new Date())
const haceDias = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d) }
const inicioMes = () => { const d = new Date(); return iso(new Date(d.getFullYear(), d.getMonth(), 1)) }
const corto = (v) => (Math.abs(v) >= 1e6 ? `${(v / 1e6).toFixed(1)} M` : Math.abs(v) >= 1e3 ? `${Math.round(v / 1e3)} mil` : String(v))
const etiquetaMetodo = (m) => (m === 'TRANSFERENCIA' ? 'Transferencia' : m === 'EFECTIVO' ? 'Efectivo' : '—')
const normalizar = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

function KPICard({ icon, label, value, sub, extra, color = 'brand' }) {
  const colors = { brand: 'text-brand-600 dark:text-brand-300', green: 'text-green-600 dark:text-green-400', red: 'text-red-500' }
  const iconBg = { brand: 'rgba(140,144,59,0.12)', green: 'rgba(34,197,94,0.12)', red: 'rgba(239,68,68,0.12)' }
  return (
    <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`} style={{ backgroundColor: iconBg[color] }}>{icon}</div>
        <span className="text-sm font-semibold" style={{ color: 'var(--tx-2)' }}>{label}</span>
      </div>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--tx-3)' }}>{sub}</p>}
      {extra}
    </div>
  )
}

function Panel({ titulo, sub, children, className = '' }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
      <h3 className="font-bold" style={{ color: 'var(--tx-1)' }}>{titulo}</h3>
      {sub && <p className="text-xs mt-0.5 mb-4" style={{ color: 'var(--tx-3)' }}>{sub}</p>}
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const [desde, setDesde] = useState(hoy())
  const [hasta, setHasta] = useState(hoy())
  const [periodo, setPeriodo] = useState(null)
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [buscar, setBuscar] = useState('')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const load = useCallback(async (d, h) => {
    setLoading(true); setError(null)
    try {
      const [p, stats] = await Promise.all([dashboardService.getPeriodo({ desde: d, hasta: h }), dashboardService.getStats()])
      setPeriodo(p)
      setStock(stats.productosStockCritico)
      setLastUpdate(new Date())
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudieron cargar las métricas.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load(hoy(), hoy()) }, [load])

  const rango = (d, h) => { setDesde(d); setHasta(h); load(d, h) }
  const unDia = desde === hasta
  const sufijo = unDia ? (desde === hoy() ? 'del día' : `del ${desde.split('-').reverse().join('/')}`) : 'del periodo'
  const p = periodo

  const lineas = (p?.lineas || []).filter(l => !buscar.trim()
    || normalizar(`${l.producto} ${l.pulgadas} ${l.descripcion} ${l.cliente}`).includes(normalizar(buscar)))
  const porDia = (p?.por_dia || []).map(d => ({ ...d, dia: d.fecha.slice(5).split('-').reverse().join('/') }))

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Dashboard</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--tx-3)' }}>Actualizado: {lastUpdate.toLocaleTimeString('es-CO')}</p>
        </div>
        <button onClick={() => load(desde, hasta)} className="flex items-center gap-2 btn-outline text-xs py-2 px-4">
          <FaSync size={11} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Fechas */}
      <div className="mb-6 p-4 rounded-2xl flex flex-wrap items-end gap-3" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
        {[['dash-desde', 'Desde', desde, setDesde], ['dash-hasta', 'Hasta', hasta, setHasta]].map(([id, label, valor, set]) => (
          <div key={id}>
            <label htmlFor={id} className="block text-xs font-semibold mb-1" style={{ color: 'var(--tx-3)' }}>{label}</label>
            <input id={id} type="date" value={valor} max={hoy()} onChange={e => set(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
          </div>
        ))}
        <button onClick={() => load(desde, hasta)} disabled={loading || !desde || !hasta}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-50">
          Consultar
        </button>
        <div className="flex gap-2 flex-wrap">
          {[['Hoy', hoy(), hoy()], ['Ayer', haceDias(1), haceDias(1)], ['Últimos 7 días', haceDias(6), hoy()], ['Este mes', inicioMes(), hoy()]].map(([l, d, h]) => (
            <button key={l} onClick={() => rango(d, h)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${desde === d && hasta === h ? 'bg-brand-600 text-white border-transparent' : 'hover:bg-brand-500/10'}`}
              style={desde === d && hasta === h ? undefined : { color: 'var(--tx-2)', borderColor: 'var(--bd-1)' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={() => load(desde, hasta)} className="btn-outline text-xs py-2 px-4">Reintentar</button>
        </div>
      )}

      {p && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <KPICard icon={<FaShoppingCart size={16} />} label={`Ventas ${sufijo}`} value={p.ventas}
              sub={`${p.unidades} unidades · productos por ${formatCOP(p.valor_productos)}`} />
            <KPICard icon={<FaMoneyBillWave size={16} />} label={`Ingresos ${sufijo}`} value={formatCOP(p.ingresos)} color="green"
              sub={`Efectivo ${formatCOP(p.ingresos_efectivo)} · Transferencia ${formatCOP(p.ingresos_transferencia)}`}
              extra={p.abonos_recibidos > 0 && <p className="text-[11px] mt-0.5" style={{ color: 'var(--tx-3)' }}>Incluye {formatCOP(p.abonos_recibidos)} de abonos a deudas</p>} />
            <KPICard icon={<FaHandHoldingUsd size={16} />} label={`Deudores ${sufijo}`} value={p.deudores} color="red"
              sub={p.deudores ? `Quedaron debiendo ${formatCOP(p.deuda_generada)} · aún deben ${formatCOP(p.saldo_pendiente)}` : 'Nadie quedó debiendo'} />
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Panel className="lg:col-span-2" titulo={unDia ? 'Ingresos y deudas del día' : 'Ingresos y deudas por día'}
              sub="Dinero recibido (ventas + abonos) frente a lo que quedaron debiendo, y número de ventas">
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={porDia} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--bd-1)" vertical={false} />
                  <XAxis dataKey="dia" tick={eje} minTickGap={12} />
                  <YAxis yAxisId="cop" tick={eje} tickFormatter={corto} width={56} />
                  <YAxis yAxisId="n" orientation="right" tick={eje} allowDecimals={false} width={30} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => (name === 'Ventas' ? v : formatCOP(v))} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="cop" dataKey="ingresos" name="Ingresos" fill={C.ingresos} radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar yAxisId="cop" dataKey="deuda" name="Quedaron debiendo" fill={C.deuda} radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Line yAxisId="n" dataKey="ventas" name="Ventas" stroke="var(--tx-2)" strokeWidth={2} dot={{ r: 2 }} type="monotone" />
                </ComposedChart>
              </ResponsiveContainer>
            </Panel>
            <Panel titulo="Recaudo por caja" sub="Lo que recibió cada persona, por forma de pago">
              {p.recaudo.length === 0 ? (
                <p className="text-sm text-center py-16" style={{ color: 'var(--tx-3)' }}>Sin pagos en este periodo</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={p.recaudo} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bd-1)" vertical={false} />
                    <XAxis dataKey="cajero" tick={eje} />
                    <YAxis tick={eje} tickFormatter={corto} width={56} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCOP(v)} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="efectivo" name="Efectivo" stackId="a" fill={C.efectivo} maxBarSize={48} />
                    <Bar dataKey="transferencia" name="Transferencia" stackId="a" fill={C.transferencia} maxBarSize={48} />
                    {p.recaudo.some(r => r.sin_dato > 0) && <Bar dataKey="sin_dato" name="Sin dato" stackId="a" fill={C.sinDato} maxBarSize={48} />}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Panel>
          </div>

          {/* Ventas del día */}
          <Panel titulo={`Ventas ${sufijo}`} sub={`${p.lineas.length} producto(s) vendido(s)`} className="mb-6">
            <div className="relative mb-3 sm:w-80">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={12} style={{ color: 'var(--tx-3)' }} />
              <input type="search" value={buscar} onChange={e => setBuscar(e.target.value)} aria-label="Buscar en las ventas"
                placeholder="Buscar producto, descripción o cliente…"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
            </div>
            <div className="overflow-x-auto max-h-[28rem] overflow-y-auto rounded-xl" style={{ border: '1px solid var(--bd-1)' }}>
              <table className="w-full text-sm min-w-[860px]">
                <thead className="sticky top-0" style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <tr className="text-left text-[11px] uppercase tracking-wider" style={{ color: 'var(--tx-3)' }}>
                    <th className="px-3 py-2.5 text-right">Cant.</th>
                    <th className="px-3 py-2.5">Producto</th>
                    <th className="px-3 py-2.5">Descripción</th>
                    <th className="px-3 py-2.5 text-right">Precio</th>
                    <th className="px-3 py-2.5 text-right">Total</th>
                    <th className="px-3 py-2.5">Cliente</th>
                    <th className="px-3 py-2.5">Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {lineas.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-10" style={{ color: 'var(--tx-3)' }}>
                      {p.lineas.length ? 'Nada coincide con la búsqueda.' : `No hubo ventas ${sufijo}.`}
                    </td></tr>
                  )}
                  {lineas.map((l, i) => (
                    <tr key={`${l.orden_id}-${i}`} style={{ borderTop: '1px solid var(--bd-1)', color: 'var(--tx-2)' }}>
                      <td className="px-3 py-2 text-right font-bold" style={{ color: 'var(--tx-1)' }}>{l.cantidad}</td>
                      <td className="px-3 py-2">
                        <span style={{ color: 'var(--tx-1)' }}>{l.producto}</span>
                        {l.pulgadas && <span className="ml-1.5 text-xs" style={{ color: 'var(--tx-3)' }}>{l.pulgadas}</span>}
                        <span className="block text-[10px]" style={{ color: 'var(--tx-3)' }}>#{l.orden_id} · {formatDateTime(l.fecha)}</span>
                      </td>
                      <td className="px-3 py-2 text-xs max-w-[220px]">{l.descripcion || <span style={{ color: 'var(--tx-3)' }}>—</span>}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">{formatCOP(l.precio_unitario)}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap font-semibold" style={{ color: 'var(--tx-1)' }}>{formatCOP(l.subtotal)}</td>
                      <td className="px-3 py-2">{l.cliente || '—'}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap" style={{ color: 'var(--tx-3)' }}>
                        {etiquetaMetodo(l.metodo_pago)}{l.recibido_por ? ` · ${l.recibido_por}` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}

      {/* Stock crítico */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
        <div className="flex items-center gap-2 mb-4">
          <FaExclamationTriangle className="text-yellow-500" size={16} />
          <h3 className="font-bold" style={{ color: 'var(--tx-1)' }}>Alerta de Stock Crítico</h3>
          {stock.length > 0 && (
            <span className="ml-auto px-2.5 py-0.5 bg-red-500/15 text-red-500 text-xs font-bold rounded-full border border-red-500/25">
              {stock.length} productos
            </span>
          )}
        </div>
        {stock.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--tx-3)' }}>✅ Todos los productos tienen stock suficiente.</p>
        ) : (
          <div className="space-y-2">
            {[...stock].sort((a, b) => a.stock_disponible - b.stock_disponible).map(s => (
              <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-raised)' }}>
                  <img src={s.imagen_url} alt={s.nombre} className="w-full h-full object-contain p-0.5" onError={e => { e.target.src = '/newLogo3.jpeg' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--tx-1)' }}>{s.nombre}</p>
                  <p className="text-xs" style={{ color: 'var(--tx-3)' }}>{CATEGORIA_LABEL[s.categoria] || s.categoria}</p>
                </div>
                <StockBadge disponible={s.stock_disponible} minimo={s.stock_minimo} showCount />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
