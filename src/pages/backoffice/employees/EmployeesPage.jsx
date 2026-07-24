import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaPowerOff, FaSearch } from 'react-icons/fa'
import { employeeService } from '../../../services/api/employeeService'
import Modal from '../../../components/ui/Modal'

const emptyForm = { nombre: '', email: '', telefono: '', password: '' }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [modal,     setModal]     = useState(null)  // null | 'create' | 'edit' | 'deactivate'
  const [selected,  setSelected]  = useState(null)
  const [form,      setForm]      = useState(emptyForm)
  const [errors,    setErrors]    = useState({})
  const [loading,   setLoading]   = useState(false)
  const [toast,     setToast]     = useState('')
  const [search,    setSearch]    = useState('')

  const load = () => employeeService.getAll().then(setEmployees).catch(() => {})
  useEffect(() => { load() }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const filtered = employees.filter(e =>
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  )

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())   e.nombre   = 'Requerido'
    if (!form.email.trim())    e.email    = 'Requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (!form.telefono.trim()) e.telefono = 'Requerido'
    if (modal === 'create' && !form.password) e.password = 'Contraseña temporal requerida'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      if (modal === 'create') {
        await employeeService.create(form)
        showToast('Empleado creado. Se enviarán credenciales por correo.')
      } else {
        await employeeService.update(selected.id, { nombre: form.nombre, telefono: form.telefono, estado: form.estado })
        showToast('Datos del empleado actualizados.')
      }
      setModal(null); load()
    } catch (err) {
      setErrors({ email: err?.response?.data?.message || 'Error al guardar.' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    setLoading(true)
    try {
      await employeeService.deactivate(selected.id)
      showToast(`Cuenta de ${selected.nombre} desactivada.`)
      setModal(null); load()
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => { setForm(emptyForm); setErrors({}); setModal('create') }
  const openEdit   = (e) => { setSelected(e); setForm({ nombre: e.nombre, email: e.email, telefono: e.telefono, estado: e.estado }); setErrors({}); setModal('edit') }
  const openDeact  = (e) => { setSelected(e); setModal('deactivate') }

  const inp = (label, key, type = 'text') => (
    <div>
      <label htmlFor={`emp-${key}`} className="block text-xs font-semibold mb-1" style={{ color: 'var(--tx-3)' }}>{label}</label>
      <input id={`emp-${key}`} type={type} value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })) }}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
        style={{ backgroundColor: 'var(--bg-input)', border: `1px solid ${errors[key] ? '#ef4444' : 'var(--bd-1)'}`, color: 'var(--tx-1)' }} />
      {errors[key] && <p className="mt-0.5 text-[10px] text-red-500">{errors[key]}</p>}
    </div>
  )

  return (
    <div>
      {toast && <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-brand-600 shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>Gestión de Personal</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--tx-3)' }}>{employees.length} empleados registrados</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm gap-2">
          <FaPlus size={12}/> Agregar empleado
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-xs mb-5">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={12} style={{ color: 'var(--tx-3)' }} />
        <input placeholder="Buscar empleado..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }} />
      </div>

      {/* Tabla */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--bd-1)' }}>
        <div className="overflow-x-auto">
        <table className="text-sm data-table">
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--bd-1)' }}>
              {['Nombre', 'Email', 'Teléfono', 'Estado', 'Último acceso', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--tx-3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--tx-3)' }}>
                  {employees.length === 0
                    ? 'No hay empleados registrados aún.'
                    : 'Ningún empleado coincide con la búsqueda.'}
                </td>
              </tr>
            )}
            {filtered.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold" style={{ color: 'var(--tx-1)' }}>{e.nombre}</p>
                  <p className="text-[10px] text-brand-500 font-semibold">{e.rol}</p>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--tx-2)' }}>{e.email}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--tx-2)' }}>{e.telefono}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${e.estado === 'ACTIVO' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25' : 'bg-red-500/10 text-red-500 border-red-500/25'}`}>
                    {e.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--tx-3)' }}>
                  {e.ultimo_acceso ? new Date(e.ultimo_acceso).toLocaleDateString('es-CO') : 'Nunca'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(e)} className="p-2 rounded-lg hover:bg-brand-500/10 transition-colors text-brand-500"><FaEdit size={13}/></button>
                    {e.estado === 'ACTIVO' && (
                      <button onClick={() => openDeact(e)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-500"><FaPowerOff size={13}/></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal Crear */}
      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Agregar Empleado">
        <div className="space-y-4">
          {inp('Nombre completo *', 'nombre')}
          {inp('Email corporativo *', 'email', 'email')}
          {inp('Teléfono *', 'telefono', 'tel')}
          {inp('Contraseña temporal *', 'password', 'password')}
          <p className="text-xs" style={{ color: 'var(--tx-3)' }}>
            El empleado deberá cambiar su contraseña en el primer inicio de sesión.
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-60">
              {loading ? 'Creando…' : 'Crear Empleado'}
            </button>
            <button onClick={() => setModal(null)} className="btn-outline flex-1 justify-center">Cancelar</button>
          </div>
        </div>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={modal === 'edit'} onClose={() => setModal(null)} title="Editar Empleado">
        <div className="space-y-4">
          {inp('Nombre completo', 'nombre')}
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--tx-3)' }}>Email (no modificable)</p>
            <p className="px-3 py-2 rounded-xl text-sm" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--tx-3)' }}>{selected?.email}</p>
          </div>
          {inp('Teléfono', 'telefono', 'tel')}
          <div>
            <label htmlFor="emp-estado-edit" className="block text-xs font-semibold mb-1" style={{ color: 'var(--tx-3)' }}>Estado</label>
            <select id="emp-estado-edit" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none appearance-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--bd-1)', color: 'var(--tx-1)' }}>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-60">
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button onClick={() => setModal(null)} className="btn-outline flex-1 justify-center">Cancelar</button>
          </div>
        </div>
      </Modal>

      {/* Modal Desactivar */}
      <Modal isOpen={modal === 'deactivate'} onClose={() => setModal(null)} title="Desactivar empleado" size="sm">
        <p className="text-sm mb-5" style={{ color: 'var(--tx-2)' }}>
          ¿Desactivar la cuenta de <strong>{selected?.nombre}</strong>? Su sesión activa en Redis será invalidada inmediatamente.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDeactivate} disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-60">
            {loading ? 'Procesando…' : 'Desactivar'}
          </button>
          <button onClick={() => setModal(null)} className="btn-outline flex-1 justify-center">Cancelar</button>
        </div>
      </Modal>
    </div>
  )
}
