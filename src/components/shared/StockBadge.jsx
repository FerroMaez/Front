import { getStockStatus } from '../../features/catalog/mockProducts'

const styles = {
  green:  'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/25',
  yellow: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/25',
  red:    'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',
}

const dots = { green: 'bg-green-500', yellow: 'bg-yellow-400', red: 'bg-red-500' }

export default function StockBadge({ disponible, minimo, showCount = false }) {
  const status = getStockStatus(disponible, minimo)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status.color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[status.color]}`} />
      {status.label}
      {showCount && disponible > 0 && <span className="opacity-70">({disponible})</span>}
    </span>
  )
}
