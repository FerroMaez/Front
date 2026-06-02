import clsx from 'clsx'

const variants = {
  primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-md hover:shadow-brand-500/30',
  outline: 'border border-brand-500 text-brand-400 hover:bg-brand-600/20',
  ghost: 'text-brand-300 hover:text-white hover:bg-white/10',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export default function Button({
  children, variant = 'primary', size = 'md', className, disabled, ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-brand-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
