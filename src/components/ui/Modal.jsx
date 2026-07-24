import { useEffect } from 'react'
import { IoCloseOutline } from 'react-icons/io5'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-overlay" />
      <div
        className={`relative w-full ${maxW[size]} rounded-2xl shadow-2xl animate-modal max-h-[90vh] overflow-y-auto`}
        style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--bd-1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            className="sticky top-0 z-10 flex items-center justify-between p-5"
            style={{ backgroundColor: 'var(--bg-raised)', borderBottom: '1px solid var(--bd-1)' }}
          >
            <h3 className="text-lg font-semibold" style={{ color: 'var(--tx-1)' }}>{title}</h3>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="p-1.5 rounded-lg transition-colors hover:bg-brand-500/10"
              style={{ color: 'var(--tx-3)' }}
            >
              <IoCloseOutline size={22} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
