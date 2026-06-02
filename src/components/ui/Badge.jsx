import clsx from 'clsx'

const variants = {
  default: 'bg-brand-600/20 text-brand-300 border border-brand-600/30',
  success: 'bg-green-600/20 text-green-300 border border-green-600/30',
  warning: 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/30',
  danger: 'bg-red-600/20 text-red-300 border border-red-600/30',
}

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
