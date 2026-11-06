import { useRef, useState } from 'react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

// Carrusel de fotos: flechas, puntos, miniaturas opcionales y deslizar con el dedo.
// Cada diapositiva se dibuja con `render(item)`; por defecto, una foto completa (sin recortar)
// sobre su propia versión desenfocada, para que las fotos verticales no queden con franjas.
export default function Carrusel({ items, render, miniaturas = false, alto = 'h-[360px] sm:h-[480px]' }) {
  const [i, setI] = useState(0)
  const toque = useRef(null)
  const n = items.length
  const ir = (k) => setI(((k % n) + n) % n)
  const actual = items[i]

  const inicio = (e) => { toque.current = e.touches[0].clientX }
  const fin = (e) => {
    if (toque.current == null) return
    const dx = e.changedTouches[0].clientX - toque.current
    if (Math.abs(dx) > 40) ir(dx < 0 ? i + 1 : i - 1)
    toque.current = null
  }

  return (
    <div>
      <div className={`relative rounded-3xl overflow-hidden shadow-float ${alto}`}
        style={{ border: '1px solid var(--bd-1)', backgroundColor: '#0b1620' }}
        onTouchStart={inicio} onTouchEnd={fin}>
        <div key={i} className="absolute inset-0 animate-fadein">
          {render ? render(actual) : <FotoCompleta src={actual.src} alt={actual.titulo} />}
        </div>

        {actual.titulo && (
          <div className="absolute inset-x-0 bottom-0 px-5 pt-10 pb-10 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(8,20,30,0.85), transparent)' }}>
            <p className="text-white font-semibold text-sm sm:text-base">{actual.titulo}</p>
          </div>
        )}

        {n > 1 && (
          <>
            <button onClick={() => ir(i - 1)} aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl text-white transition-all hover:scale-110"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <FaArrowLeft size={13} />
            </button>
            <button onClick={() => ir(i + 1)} aria-label="Siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl text-white transition-all hover:scale-110"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <FaArrowRight size={13} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {items.map((it, k) => (
                <button key={k} onClick={() => setI(k)} aria-label={`Foto ${k + 1}`}
                  className={`h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {miniaturas && n > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {items.map((it, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Ver foto ${k + 1}`}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all ${k === i ? 'ring-2 ring-aqua-500 opacity-100' : 'opacity-60 hover:opacity-100'}`}>
              <img src={it.src || it.despues} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function FotoCompleta({ src, alt }) {
  return (
    <>
      <img src={src} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50" />
      <img src={src} alt={alt || ''} loading="lazy" className="relative w-full h-full object-contain" />
    </>
  )
}
