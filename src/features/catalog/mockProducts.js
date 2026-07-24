
export const CATEGORIAS = ['TUBERIA', 'VALVULA', 'ACOPLE', 'ACCESORIO', 'OTRO']

export const TIPOS_PRODUCTO = ['VÁLVULA', 'TUBERÍA', 'ACOPLE', 'ACCESORIO', 'FITTING', 'OTRO']

export const LINEAS_SERVICIO = [
  { value: 'HIDRAULICA', label: 'Redes Hidráulicas',      slug: 'hidraulicas', folder: 'hidraulica', color: 'rgba(59,130,246,0.12)',  colorBorder: 'rgba(59,130,246,0.3)'  },
  { value: 'INCENDIO',   label: 'Redes Contra Incendios', slug: 'incendios',   folder: 'incendio',   color: 'rgba(239,68,68,0.12)',   colorBorder: 'rgba(239,68,68,0.3)'   },
  { value: 'ACUEDUCTO',  label: 'Acueducto',              slug: 'acueducto',   folder: 'acueducto',  color: 'rgba(6,182,212,0.12)',   colorBorder: 'rgba(6,182,212,0.3)'   },
  { value: 'ACERO',      label: 'Acero Inoxidable',       slug: 'acero',       folder: 'acero',      color: 'rgba(168,162,158,0.12)', colorBorder: 'rgba(168,162,158,0.3)' },
  { value: 'PVC',        label: 'PVC',                    slug: 'pvc',         folder: 'pvc',        color: 'rgba(34,197,94,0.12)',   colorBorder: 'rgba(34,197,94,0.3)'   },
]

export const STOCK_STATUS = {
  DISPONIBLE:      { label: 'Disponible',      color: 'green'  },
  ULTIMAS:         { label: 'Últimas unidades', color: 'yellow' },
  SIN_STOCK:       { label: 'Sin stock',        color: 'red'    },
}

export function getStockStatus(disponible, minimo) {
  if (disponible === 0)              return STOCK_STATUS.SIN_STOCK
  if (disponible <= minimo)          return STOCK_STATUS.ULTIMAS
  return STOCK_STATUS.DISPONIBLE
}

export const mockProducts = [
  // ── Hidráulicas ─────────────────────────────────────────────────────
  { id: 1,  nombre: 'Válvula de Bola 1/2"',           categoria: 'VALVULA',    descripcion: 'Válvula de bola en bronce para sistemas hidráulicos residenciales.',      precio_unitario: 45000,  stock_disponible: 25, stock_minimo: 5,  stock_reservado: 3,  imagen_url: '/servicios/hidraulica/VÁLVULA BOLA.png',     estado: 'ACTIVO' },
  { id: 2,  nombre: 'Válvula Compuerta 3/4"',          categoria: 'VALVULA',    descripcion: 'Válvula compuerta en hierro fundido para redes hidráulicas.',             precio_unitario: 62000,  stock_disponible: 18, stock_minimo: 4,  stock_reservado: 0,  imagen_url: '/servicios/hidraulica/VÁLVULA COMPUERTA.png',  estado: 'ACTIVO' },
  { id: 3,  nombre: 'Cheque Cortina 1"',               categoria: 'VALVULA',    descripcion: 'Válvula cheque tipo cortina para evitar retorno de flujo.',               precio_unitario: 38000,  stock_disponible: 3,  stock_minimo: 5,  stock_reservado: 1,  imagen_url: '/servicios/hidraulica/CHEQUE CORTINA.png',     estado: 'ACTIVO' },
  { id: 4,  nombre: 'Cheque Hidro 1/2"',               categoria: 'VALVULA',    descripcion: 'Válvula cheque hidrostática de alta presión.',                           precio_unitario: 42000,  stock_disponible: 12, stock_minimo: 3,  stock_reservado: 2,  imagen_url: '/servicios/hidraulica/CHEQUE HIDRO.png',       estado: 'ACTIVO' },
  { id: 5,  nombre: 'Válvula de Pie 1"',               categoria: 'VALVULA',    descripcion: 'Válvula de pie con canastilla para tuberías de succión.',                 precio_unitario: 55000,  stock_disponible: 0,  stock_minimo: 3,  stock_reservado: 0,  imagen_url: '/servicios/hidraulica/VÁLVULA DE PIE.png',     estado: 'ACTIVO' },
  { id: 6,  nombre: 'Válvula Flotadora 1/2"',          categoria: 'VALVULA',    descripcion: 'Válvula flotadora para tanques de almacenamiento.',                      precio_unitario: 35000,  stock_disponible: 20, stock_minimo: 5,  stock_reservado: 0,  imagen_url: '/servicios/hidraulica/VÁLVULA FLOTADORA.png',  estado: 'ACTIVO' },
  // ── Incendios ────────────────────────────────────────────────────────
  { id: 7,  nombre: 'Gabinete Contra Incendios',       categoria: 'ACCESORIO',  descripcion: 'Gabinete metálico con manguera y extinguidor incluido.',                 precio_unitario: 380000, stock_disponible: 8,  stock_minimo: 2,  stock_reservado: 1,  imagen_url: '/servicios/incendio/GABINETE.png',            estado: 'ACTIVO' },
  { id: 8,  nombre: 'Válvula Angular 2"',              categoria: 'VALVULA',    descripcion: 'Válvula angular para sistemas de redes contra incendios.',               precio_unitario: 95000,  stock_disponible: 15, stock_minimo: 3,  stock_reservado: 0,  imagen_url: '/servicios/incendio/VÁLVULA ANGULAR.png',     estado: 'ACTIVO' },
  { id: 9,  nombre: 'Codo Ranurado 2"',                categoria: 'ACOPLE',     descripcion: 'Codo ranurado 90° para tuberías de sistemas contra incendios.',          precio_unitario: 28000,  stock_disponible: 45, stock_minimo: 10, stock_reservado: 5,  imagen_url: '/servicios/incendio/CODO RANURADO.png',       estado: 'ACTIVO' },
  { id: 10, nombre: 'Tee Ranurada 2"',                 categoria: 'ACOPLE',     descripcion: 'Tee ranurada para derivaciones en redes contra incendios.',              precio_unitario: 32000,  stock_disponible: 30, stock_minimo: 8,  stock_reservado: 2,  imagen_url: '/servicios/incendio/TEE RANURADA.png',        estado: 'ACTIVO' },
  // ── Acueducto ────────────────────────────────────────────────────────
  { id: 11, nombre: 'Hidrante de Columna 4"',          categoria: 'ACCESORIO',  descripcion: 'Hidrante de columna para redes de acueducto urbanas.',                   precio_unitario: 850000, stock_disponible: 4,  stock_minimo: 1,  stock_reservado: 0,  imagen_url: '/servicios/acueducto/HIDRANTE.png',           estado: 'ACTIVO' },
  { id: 12, nombre: 'Macromedidor 4"',                 categoria: 'ACCESORIO',  descripcion: 'Macromedidor tipo woltmann para medición de grandes caudales.',          precio_unitario: 1200000,stock_disponible: 2,  stock_minimo: 1,  stock_reservado: 1,  imagen_url: '/servicios/acueducto/MACROMEDIDOR.png',       estado: 'ACTIVO' },
  { id: 13, nombre: 'Val. Compuerta Bridada 3"',       categoria: 'VALVULA',    descripcion: 'Válvula compuerta bridada para redes de distribución de agua potable.', precio_unitario: 145000, stock_disponible: 10, stock_minimo: 3,  stock_reservado: 0,  imagen_url: '/servicios/acueducto/VAL - COMPUERTA BRIDADA.png', estado: 'ACTIVO' },
  { id: 14, nombre: 'Válvula Reguladora Presión 2"',   categoria: 'VALVULA',    descripcion: 'Válvula reguladora de presión para redes de acueducto.',                 precio_unitario: 320000, stock_disponible: 6,  stock_minimo: 2,  stock_reservado: 1,  imagen_url: '/servicios/acueducto/VAL - REGULADORA DE PRESION.png', estado: 'ACTIVO' },
  // ── Acero Inoxidable ─────────────────────────────────────────────────
  { id: 15, nombre: 'Brida 304 2"',                    categoria: 'ACOPLE',     descripcion: 'Brida en acero inoxidable 304 para conexiones industriales.',            precio_unitario: 85000,  stock_disponible: 22, stock_minimo: 5,  stock_reservado: 0,  imagen_url: '/servicios/acero/BRIDA.png',                  estado: 'ACTIVO' },
  { id: 16, nombre: 'Tubería Inox 304 2" x 6m',        categoria: 'TUBERIA',    descripcion: 'Tubería de acero inoxidable 304, cedula 10, 6 metros de largo.',         precio_unitario: 280000, stock_disponible: 15, stock_minimo: 3,  stock_reservado: 2,  imagen_url: '/servicios/acero/TUBERIA.png',                estado: 'ACTIVO' },
  { id: 17, nombre: 'Registro Esfera Inox 1"',         categoria: 'VALVULA',    descripcion: 'Registro de esfera en acero inoxidable 316 para uso sanitario.',         precio_unitario: 125000, stock_disponible: 9,  stock_minimo: 3,  stock_reservado: 1,  imagen_url: '/servicios/acero/REGISTRO ESFERA.png',        estado: 'ACTIVO' },
  // ── PVC ──────────────────────────────────────────────────────────────
  { id: 18, nombre: 'Tubería PVC 1/2" x 6m RDE-13.5', categoria: 'TUBERIA',    descripcion: 'Tubería PVC presión RDE-13.5 para instalaciones hidráulicas.',           precio_unitario: 18000,  stock_disponible: 80, stock_minimo: 20, stock_reservado: 5,  imagen_url: '/servicios/pvc/TUBERIA.png',                  estado: 'ACTIVO' },
  { id: 19, nombre: 'Tubería PVC 1" x 6m RDE-21',     categoria: 'TUBERIA',    descripcion: 'Tubería PVC presión RDE-21 para redes residenciales.',                   precio_unitario: 28000,  stock_disponible: 60, stock_minimo: 15, stock_reservado: 3,  imagen_url: '/servicios/pvc/TUBERIA.png',                  estado: 'ACTIVO' },
  { id: 20, nombre: 'Codo PVC 90° 1/2"',              categoria: 'ACOPLE',     descripcion: 'Codo PVC 90 grados para cambio de dirección en redes hidráulicas.',     precio_unitario: 1500,   stock_disponible: 200,stock_minimo: 50, stock_reservado: 10, imagen_url: '/servicios/pvc/CODO.png',                     estado: 'ACTIVO' },
  { id: 21, nombre: 'Tee PVC 1/2"',                   categoria: 'ACOPLE',     descripcion: 'Tee PVC para derivaciones en instalaciones hidráulicas.',               precio_unitario: 2000,   stock_disponible: 2,  stock_minimo: 50, stock_reservado: 0,  imagen_url: '/servicios/pvc/TEE.png',                      estado: 'ACTIVO' },
  { id: 22, nombre: 'Unión Universal PVC 1/2"',       categoria: 'ACOPLE',     descripcion: 'Unión universal PVC para conexiones desmontables.',                     precio_unitario: 4500,   stock_disponible: 0,  stock_minimo: 30, stock_reservado: 0,  imagen_url: '/servicios/pvc/UNION UNIVERSAL.png',          estado: 'INACTIVO' },
]

export const mockOrders = [
  { id: 'ORD-001', usuario_id: 1, estado: 'PENDIENTE',    total_cotizacion: 387000, fecha_creacion: new Date(Date.now()-3600000*2).toISOString(),  cliente: { nombre: 'Juan Pérez',    telefono: '311 222 3344', email: 'juan@email.com' }, items: [{ producto_id: 1, nombre: 'Válvula de Bola 1/2"', cantidad: 5, precio_unitario_momento: 45000 }, { producto_id: 18, nombre: 'Tubería PVC 1/2" x 6m', cantidad: 3, precio_unitario_momento: 18000 }] },
  { id: 'ORD-002', usuario_id: 2, estado: 'EN_PROCESO',   total_cotizacion: 1640000,fecha_creacion: new Date(Date.now()-3600000*5).toISOString(),  cliente: { nombre: 'María García',  telefono: '300 555 6677', email: 'maria@empresa.com' }, items: [{ producto_id: 12, nombre: 'Macromedidor 4"', cantidad: 1, precio_unitario_momento: 1200000 }, { producto_id: 13, nombre: 'Val. Compuerta Bridada 3"', cantidad: 3, precio_unitario_momento: 145000 }] },
  { id: 'ORD-003', usuario_id: 3, estado: 'PENDIENTE',    total_cotizacion: 216000, fecha_creacion: new Date(Date.now()-3600000*1).toISOString(),  cliente: { nombre: 'Carlos López',  telefono: '316 888 9900', email: 'carlos@obra.co' }, items: [{ producto_id: 9, nombre: 'Codo Ranurado 2"', cantidad: 8, precio_unitario_momento: 27000 }] },
  { id: 'ORD-004', usuario_id: 4, estado: 'VENTA_EXITOSA',total_cotizacion: 760000, fecha_creacion: new Date(Date.now()-3600000*24).toISOString(), cliente: { nombre: 'Ana Rodríguez', telefono: '318 111 2233', email: 'ana@constructora.co' }, items: [{ producto_id: 7, nombre: 'Gabinete Contra Incendios', cantidad: 2, precio_unitario_momento: 380000 }] },
  { id: 'ORD-005', usuario_id: 5, estado: 'CANCELADA',    total_cotizacion: 320000, fecha_creacion: new Date(Date.now()-3600000*48).toISOString(), motivo_cancelacion: 'Cliente desistió de la compra', cliente: { nombre: 'Luis Torres', telefono: '320 444 5566', email: 'luis@gmail.com' }, items: [{ producto_id: 14, nombre: 'Válvula Reguladora Presión 2"', cantidad: 1, precio_unitario_momento: 320000 }] },
]

export const mockEmployees = [
  { id: 'E1', nombre: 'Andrea Martínez', email: 'andrea@manhid.com', telefono: '301 234 5678', rol: 'EMPLEADO', estado: 'ACTIVO',   fecha_creacion: '2024-01-15', ultimo_acceso: new Date(Date.now()-3600000).toISOString() },
  { id: 'E2', nombre: 'Pedro Sánchez',   email: 'pedro@manhid.com',  telefono: '302 876 5432', rol: 'EMPLEADO', estado: 'ACTIVO',   fecha_creacion: '2024-03-20', ultimo_acceso: new Date(Date.now()-7200000).toISOString() },
  { id: 'E3', nombre: 'Camila Ruiz',     email: 'camila@manhid.com', telefono: '303 111 2222', rol: 'EMPLEADO', estado: 'INACTIVO', fecha_creacion: '2023-09-01', ultimo_acceso: new Date(Date.now()-86400000*7).toISOString() },
]

export { formatCOP } from '../../utils/formatters'

export const catalogImages = [
  '/catalogo/catalogo-1.png',
  '/catalogo/catalogo-2.png',
  '/catalogo/catalogo-3.png',
  '/catalogo/catalogo-4.png',
  '/catalogo/catalogo-5.jpeg',
]
