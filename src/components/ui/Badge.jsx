import clsx from 'clsx'

const variants = {
  default: 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border-brand-500/30',
  success: 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30',
  warning: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
  danger: 'bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30',
}

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border', variants[variant], className)}>
      {children}
    </span>
  )
}
