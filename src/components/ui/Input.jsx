import clsx from 'clsx'

export default function Input({ label, error, className, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--tx-2)' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors',
          className,
        )}
        style={{
          backgroundColor: 'var(--bg-input)',
          border: `1px solid ${error ? '#ef4444' : 'var(--bd-1)'}`,
          color: 'var(--tx-1)',
        }}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
