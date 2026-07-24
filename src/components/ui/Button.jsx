import clsx from 'clsx'

const variants = {
  primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-md hover:shadow-brand-500/30 hover:-translate-y-px',
  outline: 'border border-brand-500/50 text-brand-600 dark:text-brand-300 hover:bg-brand-500/10 hover:border-brand-500',
  ghost: 'text-brand-600 dark:text-brand-300 hover:bg-brand-500/10',
  danger: 'bg-red-600 hover:bg-red-500 text-white shadow-md',
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
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
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
