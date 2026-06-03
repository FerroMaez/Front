import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { FaBoxes, FaClipboardList, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSync } from 'react-icons/fa'
import { mockOrders, mockProducts } from '../../../features/catalog/mockProducts'
import { formatCOP } from '../../../utils/formatters'
import StockBadge from '../../../components/shared/StockBadge'

const BRAND = '#8C903B'
const COLORS = ['#8C903B', '#ef4444']

function KPICard({ icon, label, value, sub, color = 'brand' }) {
  const colors = { brand: 'text-brand-600 dark:text-brand-300', green: 'text-green-600 dark:text-green-400', red: 'text-red-500', yellow: 'text-yellow-600 dark:text-yellow-300' }
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(140,144,59,0.12)' }}>
          <span className={`text-brand-500 ${colors[color]}`}>{icon}</span>
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--tx-2)' }}>{label}</p>
      </div>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--tx-3)' }}>{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [loading,    setLoading]    = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => { setTimeout(() => setLoading(false), 600) }, [])

  const refresh = () => { setLoading(true); setTimeout(() => { setLoading(false); setLastUpdate(new Date()) }, 500) }

  // ── Métricas ────────────────────────────────────────────────────────
  const total     = mockOrders.length
  const exitosas  = mockOrders.filter(o => o.estado === 'VENTA_EXITOSA').length
  const canceladas= mockOrders.filter(o => o.estado === 'CANCELADA').length
  const pendientes= mockOrders.filter(o => ['PENDIENTE', 'EN_PROCESO'].includes(o.estado)).length
  const tasa      = exitosas + canceladas > 0 ? Math.round((exitosas / (exitosas + canceladas)) * 100) : 0
  const ingresos  = mockOrders.filter(o => o.estado === 'VENTA_EXITOSA').reduce((s, o) => s + o.total_cotizacion, 0)
  const stockCritico = mockProducts.filter(p => p.estado === 'ACTIVO' && p.stock_disponible <= p.stock_minimo)

  // Top 5 productos más cotizados
  const productCount = {}
  mockOrders.forEach(o => o.items?.forEach(i => {
    productCount[i.nombre] = (productCount[i.nombre] || 0) + i.cantidad
  }))
  const top5 = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, val]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, cotizaciones: val }))

  // Pie chart exitosas vs canceladas
  const pieData = [
    { name: 'Ventas Exitosas', value: exitosas },
    { name: 'Canceladas',      value: canceladas },
  ].filter(d => d.value > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSync size={24} className="mx-auto mb-3 animate-spin text-brand-500" />
          <p className="text-sm" style={{ color: 'var(--tx-3)' }}>Cargando métricas…</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Dashboard</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--tx-3)' }}>Actualizado: {lastUpdate.toLocaleTimeString('es-CO')}</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 btn-outline text-xs py-2 px-4">
          <FaSync size={11}/> Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard icon={<FaClipboardList size={16}/>}  label="Total órdenes"    value={total}      sub="Historial completo" />
        <KPICard icon={<FaCheckCircle size={16}/>}    label="Ventas exitosas"  value={exitosas}   sub={`${tasa}% tasa de conversión`} color="green" />
        <KPICard icon={<FaTimesCircle size={16}/>}    label="Canceladas"       value={canceladas} sub="Órdenes cerradas"  color="red" />
        <KPICard icon={<FaBoxes size={16}/>}          label="Ingresos"         value={formatCOP(ingresos)} sub="Ventas exitosas" color="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top 5 productos */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--tx-1)' }}>Top 5 Productos Más Cotizados</h3>
          {top5.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--tx-3)' }}>No hay datos suficientes</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={top5} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--tx-3)' }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: 'var(--tx-2)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="cotizaciones" fill={BRAND} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie eficiencia */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
          <h3 className="font-bold mb-1" style={{ color: 'var(--tx-1)' }}>Eficiencia de Ventas</h3>
          <p className="text-3xl font-bold text-brand-600 dark:text-brand-300 mb-4">{tasa}%</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)', borderRadius: 12, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: 'var(--tx-3)' }}>Sin datos aún</p>
          )}
          <div className="grid grid-cols-2 gap-2 mt-2 text-center text-xs">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <p className="font-bold text-lg text-green-600 dark:text-green-400">{exitosas}</p>
              <p style={{ color: 'var(--tx-3)' }}>Exitosas</p>
            </div>
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <p className="font-bold text-lg text-red-500">{canceladas}</p>
              <p style={{ color: 'var(--tx-3)' }}>Canceladas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock crítico */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}>
        <div className="flex items-center gap-2 mb-4">
          <FaExclamationTriangle className="text-yellow-500" size={16}/>
          <h3 className="font-bold" style={{ color: 'var(--tx-1)' }}>Alerta de Stock Crítico</h3>
          {stockCritico.length > 0 && (
            <span className="ml-auto px-2.5 py-0.5 bg-red-500/15 text-red-500 text-xs font-bold rounded-full border border-red-500/25">
              {stockCritico.length} productos
            </span>
          )}
        </div>
        {stockCritico.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--tx-3)' }}>✅ Todos los productos tienen stock suficiente.</p>
        ) : (
          <div className="space-y-2">
            {stockCritico.sort((a, b) => a.stock_disponible - b.stock_disponible).map(p => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-raised)' }}>
                  <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain p-0.5" onError={e => { e.target.src = '/newLogo3.jpeg' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--tx-1)' }}>{p.nombre}</p>
                  <p className="text-xs" style={{ color: 'var(--tx-3)' }}>{p.categoria}</p>
                </div>
                <StockBadge disponible={p.stock_disponible} minimo={p.stock_minimo} showCount />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
