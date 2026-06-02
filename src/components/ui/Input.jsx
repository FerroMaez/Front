import clsx from 'clsx'

export default function Input({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <input
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors',
          error ? 'border-red-500' : 'border-white/10 hover:border-white/20',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
