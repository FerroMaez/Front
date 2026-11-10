import { FaExclamationTriangle } from 'react-icons/fa'
import Modal from './Modal'

/**
 * Confirmación final antes de una operación ("¿Estás seguro?").
 * @param {{ abierto: boolean, titulo: string, mensaje?: string, detalles?: Array<[string, import('react').ReactNode]>,
 *           textoConfirmar?: string, peligro?: boolean, cargando?: boolean, onConfirmar: () => void, onCancelar: () => void }} props
 */
export default function ConfirmDialog({ abierto, titulo, mensaje, detalles = [], textoConfirmar = 'Sí, confirmar',
  peligro = false, cargando = false, onConfirmar, onCancelar }) {
  return (
    <Modal isOpen={abierto} onClose={onCancelar} title={titulo} size="sm">
      <div className="flex items-start gap-3 mb-4">
        <span className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${peligro ? 'bg-red-500/15 text-red-500' : 'bg-brand-500/15 text-brand-600 dark:text-brand-300'}`}>
          <FaExclamationTriangle size={13} />
        </span>
        <p className="text-sm" style={{ color: 'var(--tx-2)' }}>{mensaje || 'Revisa los datos antes de confirmar.'}</p>
      </div>
      {detalles.length > 0 && (
        <dl className="mb-5 rounded-xl divide-y text-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--bd-1)', borderColor: 'var(--bd-1)' }}>
          {detalles.filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-3 py-2" style={{ borderColor: 'var(--bd-1)' }}>
              <dt style={{ color: 'var(--tx-3)' }}>{k}</dt>
              <dd className="font-semibold text-right" style={{ color: 'var(--tx-1)' }}>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="flex gap-3">
        <button onClick={onConfirmar} disabled={cargando} autoFocus
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-colors disabled:opacity-60 ${peligro ? 'bg-red-600 hover:bg-red-500' : 'bg-brand-600 hover:bg-brand-500'}`}>
          {cargando ? 'Procesando…' : textoConfirmar}
        </button>
        <button onClick={onCancelar} disabled={cargando} className="btn-outline flex-1 justify-center">Revisar de nuevo</button>
      </div>
    </Modal>
  )
}
