import { useState, useEffect, useCallback } from 'react'
import { FaSearch, FaSyncAlt, FaInfoCircle, FaChevronRight } from 'react-icons/fa'
import { ComposedChart, BarChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'
import { productService } from '../../../services/api/productService'
import Modal from '../../../components/ui/Modal'
import { historicoService } from '../../../services/api/historicoService'
import { formatCOP, formatDateTime } from '../../../utils/formatters'

const hoy = () => new Date().toISOString().slice(0, 10)
const inicioDeMes = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10) }
const normalizar = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const C = { adquisicion: '#64748b', vendido: '#8C903B', ganancia: '#16a34a', margen: '#0ea5e9', sinVentas: '#ef4444' }
const tooltipStyle = { backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)', borderRadius: 12, fontSize: 12, color: 'var(--tx-1)' }
const eje = { fontSize: 11, fill: 'var(--tx-3)' }
const corto = (v) => (Math.abs(v) >= 1e6 ? `${(v / 1e6).toFixed(1)} M` : Math.abs(v) >= 1e3 ? `${Math.round(v / 1e3)} mil` : String(v))
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Adquisición, vendido y ganancia agrupados por mes (o por día si el periodo es corto). */
function serieTemporal(ventas) {
  if (!ventas.length) return []
  const fechas = ventas.map(v => v.fecha).filter(Boolean).sort()
  const dias = (new Date(fechas[fechas.length - 1]) - new Date(fechas[0])) / 86400000
  const porDia = dias <= 45
  const grupos = new Map()
  for (const v of ventas) {
    if (!v.fecha) continue
    const clave = porDia ? v.fecha.slice(0, 10) : v.fecha.slice(0, 7)
    if (!grupos.has(clave)) grupos.set(clave, { clave, adquisicion: 0, vendido: 0, ganancia: 0, vendidoConCosto: 0 })
    const g = grupos.get(clave)
    g.vendido += v.valor_venta
    if (v.valor_adquisicion != null) {
      g.adquisicion += v.valor_adquisicion
      g.ganancia += v.ganancia
      g.vendidoConCosto += v.valor_venta
    }
  }
  return [...grupos.values()].sort((a, b) => a.clave.localeCompare(b.clave)).map(g => ({
    ...g,
    etiqueta: porDia ? g.clave.slice(5).split('-').reverse().join('/') : `${MESES[Number(g.clave.slice(5, 7)) - 1]} ${g.clave.slice(2, 4)}`,
    margen: g.vendidoConCosto > 0 ? Math.round((g.ganancia / g.vendidoConCosto) * 1000) / 10 : null,
  }))
}

const margen = (ganancia, vendido) => (vendido > 0 && ganancia != null ? Math.round((ganancia / vendido) * 1000) / 10 : null)

function Tarjeta({ label, value, sub, tono = 'var(--tx-1)', onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick}
      className={`p-4 rounded-2xl text-left w-full ${onClick ? 'transition-colors hover:border-brand-500 cursor-pointer group' : ''}`}
      style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--tx-3)' }}>
        {label}{onClick && <FaChevronRight size={10} className="text-brand-500 group-hover:translate-x-0.5 transition-transform" />}
      </p>
      <p className="text-xl sm:text-2xl font-bold mt-1.5" style={{ color: tono }}>{value}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: 'var(--tx-3)' }}>{sub}</p>}
    </Tag>
  )
}

const colorGanancia = (g) => (g == null ? 'var(--tx-3)' : g < 0 ? '#ef4444' : '#16a34a')

export default function HistoricosPage() {
  const [desde,   setDesde]   = useState('')
  const [hasta,   setHasta]   = useState('')
  const [datos,   setDatos]   = useState(null)
  const [error,   setError]   = useState('')
  const [cargando, setCargando] = useState(true)
  const [vista,   setVista]   = useState('informe')   // 'informe' | 'ventas'
  const [buscar,  setBuscar]  = useState('')
  const [verProductos, setVerProductos] = useState(false)
  const [sinVentas, setSinVentas] = useState(true)       // incluir productos de Inventario que no se vendieron
  const [inventario, setInventario] = useState([])

  const cargar = useCallback(async (rango) => {
    setCargando(true); setError('')
    try {
      setDatos(await historicoService.consultar(rango))
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los históricos.')
    } finally { setCargando(false) }
  }, [])

  useEffect(() => { cargar({}) }, [cargar])
  useEffect(() => {
    productService.getAll({ tipoInventario: 'INVENTARIO' })
      .then(r => setInventario(r.data.filter(x => x.estado === 'ACTIVO'))).catch(() => {})
  }, [])

  const aplicarRango = (d, h) => { setDesde(d); setHasta(h); cargar({ desde: d, hasta: h }) }

  const texto = normalizar(buscar)
  const coincide = (r) => !texto || normalizar(`${r.producto} ${r.pulgadas}`).includes(texto)
  const informe = (datos?.informe || []).filter(coincide)
  const ventas  = (datos?.ventas  || []).filter(coincide)
  const t = datos?.totales
  const serie = serieTemporal(datos?.ventas || [])

  // Productos vendidos + (opcional) los de Inventario que no se vendieron en el periodo
  const vendidos = (datos?.informe || []).map(r => ({ ...r, etiqueta: `${r.producto}${r.pulgadas ? ` ${r.pulgadas}` : ''}` }))
  const idsVendidos = new Set(vendidos.map(r => r.producto_id))
  const noVendidos = inventario.filter(x => !idsVendidos.has(x.id)).map(x => ({
    producto_id: x.id, producto: x.nombre, pulgadas: x.pulgadas, etiqueta: `${x.nombre}${x.pulgadas ? ` ${x.pulgadas}` : ''}`,
    unidades: 0, total_adquisicion: 0, total_vendido: 0, total_ganancia: 0, unidades_sin_valor: 0, stock: x.stock_disponible,
  }))
  const productosGrafica = [...vendidos.sort((a, b) => b.unidades - a.unidades), ...(sinVentas ? noVendidos.sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, 'es', { numeric: true })) : [])]

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Históricos</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--tx-3)' }}>
            Valor de adquisición y valor de venta de lo vendido: cuánto se ganó por cada producto
          </p>
        </div>
        <button onClick={() => cargar({ desde, hasta })} disabled={cargando}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors hover:bg-brand-500/10 disabled:opacity-50"
          style={{ color: 'var(--tx-2)', borderColor: 'var(--bd-1)' }}>
          <FaSyncAlt size={11} className={cargando ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Rango de fechas */}
      <div className="mb-5 p-4 rounded-2xl flex flex-wrap items-end gap-3" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
        {[['hist-desde', 'Desde', desde, setDesde], ['hist-hasta', 'Hasta', hasta, setHasta]].map(([id, label, valor, set]) => (
          <div key={id}>
            <label htmlFor={id} className="block text-xs font-semibold mb-1" style={{ color: 'var(--tx-3)' }}>{label}</label>
            <input id={id} type="date" value={valor} onChange={e => set(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
          </div>
        ))}
        <button onClick={() => cargar({ desde, hasta })} disabled={cargando}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-50">
          Consultar
        </button>
        <div className="flex gap-2 flex-wrap">
          {[['Este mes', inicioDeMes(), hoy()], ['Hoy', hoy(), hoy()], ['Todo', '', '']].map(([label, d, h]) => (
            <button key={label} onClick={() => aplicarRango(d, h)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border hover:bg-brand-500/10 transition-colors"
              style={{ color: 'var(--tx-2)', borderColor: 'var(--bd-1)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {t && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <Tarjeta label="Total adquisición" value={formatCOP(t.total_adquisicion)} sub={`${t.unidades} unidades vendidas`} />
          <Tarjeta label="Total vendido" value={formatCOP(t.total_vendido)} sub="Lo que pagaron los clientes" tono="var(--tx-1)" />
          <Tarjeta label="Ganancia" value={formatCOP(t.total_ganancia)} tono={colorGanancia(t.total_ganancia)}
            sub={t.unidades_sin_valor > 0 ? 'Solo ventas con valor de adquisición'
              : margen(t.total_ganancia, t.total_vendido) != null ? `Margen ${margen(t.total_ganancia, t.total_vendido)} %` : ''} />
          <Tarjeta label="Productos vendidos" value={datos.informe.length} onClick={() => setVerProductos(true)}
            sub={`${noVendidos.length} de Inventario sin ventas · ver lista y gráfica`} />
        </div>
      )}

      {t?.unidades_sin_valor > 0 && (
        <p className="mb-4 flex items-start gap-2 text-xs p-3 rounded-xl"
          style={{ backgroundColor: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', color: 'var(--tx-2)' }}>
          <FaInfoCircle className="mt-0.5 flex-shrink-0 text-yellow-600" size={12} />
          {t.unidades_sin_valor} unidad(es) se vendieron sin valor de adquisición registrado: cuentan en lo vendido,
          pero no en la ganancia. Registra el valor de adquisición del producto en Inventario para las próximas ventas.
        </p>
      )}

      {serie.length > 0 && (
        <div className="mb-5 p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold" style={{ color: 'var(--tx-1)' }}>Adquisición vs. vendido vs. ganancia</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--tx-3)' }}>
                Por {serie.length && serie[0].clave.length === 10 ? 'día' : 'mes'} · barras en pesos (eje izquierdo) · margen de ganancia en % (eje derecho)
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={serie} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd-1)" vertical={false} />
              <XAxis dataKey="etiqueta" tick={eje} minTickGap={10} />
              <YAxis yAxisId="cop" tick={eje} tickFormatter={corto} width={60} />
              <YAxis yAxisId="pct" orientation="right" tick={eje} unit=" %" width={44} domain={[0, 'auto']} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => (name === 'Margen' ? `${v} %` : formatCOP(v))} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="cop" dataKey="adquisicion" name="Total adquisición" fill={C.adquisicion} radius={[3, 3, 0, 0]} maxBarSize={28} />
              <Bar yAxisId="cop" dataKey="vendido" name="Total vendido" fill={C.vendido} radius={[3, 3, 0, 0]} maxBarSize={28} />
              <Bar yAxisId="cop" dataKey="ganancia" name="Ganancia" fill={C.ganancia} radius={[3, 3, 0, 0]} maxBarSize={28} />
              <Line yAxisId="pct" dataKey="margen" name="Margen" stroke={C.margen} strokeWidth={2} dot={{ r: 2.5 }} type="monotone" connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pestañas + buscador */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div role="tablist" className="inline-flex rounded-xl overflow-hidden text-xs font-bold" style={{ border: '1px solid var(--bd-1)' }}>
          {[['informe', 'Informe por producto'], ['ventas', 'Detalle de ventas']].map(([v, label]) => (
            <button key={v} role="tab" aria-selected={vista === v} onClick={() => setVista(v)}
              className={`px-4 py-2 transition-colors ${vista === v ? 'bg-brand-600 text-white' : 'hover:bg-brand-500/10'}`}
              style={vista === v ? undefined : { color: 'var(--tx-2)' }}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={12} style={{ color: 'var(--tx-3)' }} />
          <input type="search" value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar producto o medida…"
            aria-label="Buscar producto"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
        </div>
      </div>

      <div className="rounded-2xl overflow-x-auto" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
        {cargando && !datos ? (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--tx-3)' }}>Cargando…</p>
        ) : vista === 'informe' ? (
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider" style={{ color: 'var(--tx-3)', borderBottom: '1px solid var(--bd-1)' }}>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3 text-right">Unidades</th>
                <th className="px-4 py-3 text-right">Total adquisición</th>
                <th className="px-4 py-3 text-right">Total vendido</th>
                <th className="px-4 py-3 text-right">Ganancia</th>
                <th className="px-4 py-3 text-right">Margen</th>
              </tr>
            </thead>
            <tbody>
              {informe.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10" style={{ color: 'var(--tx-3)' }}>No hay ventas en este periodo.</td></tr>
              )}
              {informe.map(r => (
                <tr key={r.producto_id} style={{ borderTop: '1px solid var(--bd-1)', color: 'var(--tx-2)' }}>
                  <td className="px-4 py-3">
                    <span className="font-semibold" style={{ color: 'var(--tx-1)' }}>{r.producto}</span>
                    {r.pulgadas && <span className="ml-1.5 text-xs" style={{ color: 'var(--tx-3)' }}>{r.pulgadas}</span>}
                    {r.unidades_sin_valor > 0 && (
                      <span className="block text-[10px] text-yellow-600">{r.unidades_sin_valor} und. sin valor de adquisición</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{r.unidades}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{formatCOP(r.total_adquisicion)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap font-semibold" style={{ color: 'var(--tx-1)' }}>{formatCOP(r.total_vendido)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap font-bold" style={{ color: colorGanancia(r.total_ganancia) }}>{formatCOP(r.total_ganancia)}</td>
                  <td className="px-4 py-3 text-right" style={{ color: 'var(--tx-3)' }}>
                    {(() => { const vendidoConCosto = r.unidades_sin_valor > 0 ? null : r.total_vendido; const m = margen(r.total_ganancia, vendidoConCosto); return m == null ? '—' : `${m} %` })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider" style={{ color: 'var(--tx-3)', borderBottom: '1px solid var(--bd-1)' }}>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3 text-right">Cant.</th>
                <th className="px-4 py-3 text-right">Valor adquisición</th>
                <th className="px-4 py-3 text-right">Valor venta</th>
                <th className="px-4 py-3 text-right">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10" style={{ color: 'var(--tx-3)' }}>No hay ventas en este periodo.</td></tr>
              )}
              {ventas.map((v, i) => (
                <tr key={`${v.orden_id}-${v.producto_id}-${i}`} style={{ borderTop: '1px solid var(--bd-1)', color: 'var(--tx-2)' }}>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">{v.fecha ? formatDateTime(v.fecha) : '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-600 dark:text-brand-300">#{v.orden_id}</td>
                  <td className="px-4 py-3">{v.cliente || '—'}</td>
                  <td className="px-4 py-3">
                    <span style={{ color: 'var(--tx-1)' }}>{v.producto}</span>
                    {v.pulgadas && <span className="ml-1.5 text-xs" style={{ color: 'var(--tx-3)' }}>{v.pulgadas}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">{v.cantidad}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{v.valor_adquisicion != null ? formatCOP(v.valor_adquisicion) : <span className="text-yellow-600 text-xs">Sin registrar</span>}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap font-semibold" style={{ color: 'var(--tx-1)' }}>{formatCOP(v.valor_venta)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap font-bold" style={{ color: colorGanancia(v.ganancia) }}>{v.ganancia != null ? formatCOP(v.ganancia) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal isOpen={verProductos} onClose={() => setVerProductos(false)} size="xl"
        title={`Productos vendidos (${vendidos.length})${desde || hasta ? ` · ${desde || '…'} a ${hasta || '…'}` : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="text-xs" style={{ color: 'var(--tx-3)' }}>
            Unidades vendidas por producto. En rojo, los productos de Inventario que no se han vendido en este periodo.
          </p>
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--tx-2)' }}>
            <input type="checkbox" checked={sinVentas} onChange={e => setSinVentas(e.target.checked)} className="accent-brand-600" />
            Mostrar los que no se vendieron ({noVendidos.length})
          </label>
        </div>
        <div className="rounded-xl p-3 mb-4 max-h-[45vh] overflow-y-auto" style={{ border: '1px solid var(--bd-1)', backgroundColor: 'var(--bg-surface)' }}>
          <ResponsiveContainer width="100%" height={Math.max(160, productosGrafica.length * 22 + 40)}>
            <BarChart data={productosGrafica} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd-1)" horizontal={false} />
              <XAxis type="number" tick={eje} allowDecimals={false} orientation="top" />
              <YAxis type="category" dataKey="etiqueta" width={210} tick={{ fontSize: 10, fill: 'var(--tx-2)' }} interval={0} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} und.`, 'Vendidas']} />
              <Bar dataKey="unidades" name="Unidades" radius={[0, 4, 4, 0]} minPointSize={3} label={{ position: 'right', fontSize: 10, fill: 'var(--tx-3)' }}>
                {productosGrafica.map(r => <Cell key={r.producto_id} fill={r.unidades > 0 ? C.vendido : C.sinVentas} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--bd-1)' }}>
          <table className="w-full text-sm min-w-[640px]">
            <thead style={{ backgroundColor: 'var(--bg-surface)' }}>
              <tr className="text-left text-[11px] uppercase tracking-wider" style={{ color: 'var(--tx-3)' }}>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Producto</th>
                <th className="px-3 py-2 text-right">Unidades</th>
                <th className="px-3 py-2 text-right">Vendido</th>
                <th className="px-3 py-2 text-right">Ganancia</th>
                <th className="px-3 py-2 text-right">% de lo vendido</th>
              </tr>
            </thead>
            <tbody>
              {productosGrafica.map((r, i) => (
                <tr key={r.producto_id} style={{ borderTop: '1px solid var(--bd-1)', color: 'var(--tx-2)' }}>
                  <td className="px-3 py-2 text-xs" style={{ color: 'var(--tx-3)' }}>{i + 1}</td>
                  <td className="px-3 py-2">
                    <span style={{ color: 'var(--tx-1)' }}>{r.producto}</span>
                    {r.pulgadas && <span className="ml-1.5 text-xs" style={{ color: 'var(--tx-3)' }}>{r.pulgadas}</span>}
                    {r.unidades === 0 && <span className="ml-2 text-[10px] font-bold uppercase text-red-500">Sin ventas{r.stock != null ? ` · stock ${r.stock}` : ''}</span>}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold" style={{ color: 'var(--tx-1)' }}>{r.unidades}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{formatCOP(r.total_vendido)}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap font-semibold" style={{ color: colorGanancia(r.unidades ? r.total_ganancia : null) }}>
                    {r.unidades ? formatCOP(r.total_ganancia) : '—'}
                  </td>
                  <td className="px-3 py-2 text-right text-xs" style={{ color: 'var(--tx-3)' }}>
                    {t?.total_vendido > 0 ? `${Math.round((r.total_vendido / t.total_vendido) * 1000) / 10} %` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      <p className="mt-3 text-[11px]" style={{ color: 'var(--tx-3)' }}>
        El valor de venta es lo que pagó el cliente: si la orden tuvo descuento, se reparte entre sus productos en proporción.
        El valor de adquisición es el que tenía el producto en Inventario al momento de la venta.
      </p>
    </div>
  )
}
