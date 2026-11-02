// Guía circular para el reconocimiento facial: oscurece todo lo que está fuera del círculo
// (así queda claro dónde poner la cara) y su borde se llena como barra de progreso.
//
// estado: 'sin-cara' | 'lejos' | 'fuera' | 'ok' | 'listo'   progreso: 0..1

const COLOR = {
  'sin-cara': 'rgba(255,255,255,0.55)',
  lejos: '#f59e0b',
  fuera: '#f59e0b',
  ok: '#22c55e',
  listo: '#22c55e',
}

export const MENSAJE_CIRCULO = {
  'sin-cara': 'Pon tu cara dentro del círculo',
  lejos: 'Acércate un poco más',
  fuera: 'Centra tu cara en el círculo',
  ok: 'Quédate quieto…',
  listo: 'Verificando…',
}

/** @param {{ estado: string, progreso: number, className?: string, oscurecer?: boolean }} props */
export default function CirculoRostro({ estado, progreso, className = '', oscurecer = true }) {
  const R = 47                      // radio en el viewBox 100x100 (deja espacio al trazo)
  const perimetro = 2 * Math.PI * R
  const color = COLOR[estado] || COLOR['sin-cara']
  return (
    <div className={`relative aspect-square rounded-full pointer-events-none ${className}`}
      // Sombra gigante = máscara oscura alrededor del círculo, sin tapar la cara
      style={oscurecer ? { boxShadow: '0 0 0 200vmax rgba(2,6,23,0.62)' } : undefined}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
        {/* Anillo base: guía de dónde va la cara */}
        <circle cx="50" cy="50" r={R} fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="2.5"
          strokeDasharray={estado === 'sin-cara' ? '3 2.2' : undefined} />
        {/* Progreso de la lectura */}
        <circle cx="50" cy="50" r={R} fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round"
          strokeDasharray={perimetro} strokeDashoffset={perimetro * (1 - Math.min(1, Math.max(0, progreso)))}
          style={{ transition: 'stroke-dashoffset 0.25s ease-out, stroke 0.2s' }} />
      </svg>
    </div>
  )
}
