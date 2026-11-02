import { useCallback, useEffect, useRef, useState } from 'react'
import { abrirCamara, cargarModelos, cerrarCamara, detectar, posicionEnCirculo, promediar } from './rostro'

const INTERVALO_MS = 200

/**
 * Cámara + círculo guía + barra de progreso, compartido por la tablet y los popups.
 *
 * Mientras `habilitado` sea true abre la cámara; lee la cara solo mientras `leyendo` sea true
 * (el registro espera a que el usuario acepte y pulse "Registrar"). Cuenta una lectura cada vez que
 * la cara está dentro del círculo (y, si `exigirOjosAbiertos`, con los ojos abiertos); si sale
 * del círculo y `seguidas`, la barra vuelve a cero. Al completar `capturas` llama a
 * `onCompleto(huellaPromedio)` y se pausa hasta `reiniciar()`.
 */
export function useCapturaRostro({ habilitado = true, leyendo = true, capturas = 5, seguidas = true, exigirOjosAbiertos = false, onCompleto }) {
  const video = useRef(null)
  const stream = useRef(null)
  const lecturas = useRef([])
  const pausado = useRef(false)
  const onCompletoRef = useRef(onCompleto)
  onCompletoRef.current = onCompleto
  const leyendoRef = useRef(leyendo)
  leyendoRef.current = leyendo

  const [estado, setEstado] = useState('cargando') // cargando | listo | error
  const [guia, setGuia] = useState('sin-cara')
  const [progreso, setProgreso] = useState(0)

  // Modelos + cámara
  useEffect(() => {
    if (!habilitado) return undefined
    let cancelado = false
    setEstado('cargando')
    ;(async () => {
      try {
        await cargarModelos()
        const s = await abrirCamara(video.current)
        if (cancelado) { cerrarCamara(s); return }
        stream.current = s
        setEstado('listo')
      } catch {
        if (!cancelado) setEstado('error')
      }
    })()
    return () => { cancelado = true; cerrarCamara(stream.current); stream.current = null }
  }, [habilitado])

  // Bucle de lectura
  useEffect(() => {
    if (estado !== 'listo') return undefined
    let vivo = true
    const paso = async () => {
      if (!pausado.current && leyendoRef.current) {
        const cara = await detectar(video.current).catch(() => null)
        if (!vivo) return
        const pos = posicionEnCirculo(cara && cara.score >= 0.6 ? cara : null)
        const valida = pos === 'ok' && (!exigirOjosAbiertos || cara.ear > 0.25)
        setGuia(pos)
        if (valida) {
          lecturas.current.push(Array.from(cara.descriptor))
          setProgreso(lecturas.current.length / capturas)
          if (lecturas.current.length >= capturas) {
            pausado.current = true
            onCompletoRef.current?.(promediar(lecturas.current))
          }
        } else if (seguidas && lecturas.current.length) {
          lecturas.current = []                     // salió del círculo: barra a cero
          setProgreso(0)
        }
      }
      if (vivo) setTimeout(paso, INTERVALO_MS)
    }
    paso()
    return () => { vivo = false }
  }, [estado, capturas, seguidas, exigirOjosAbiertos])

  /** Vuelve a empezar (barra en cero) y reanuda la lectura. */
  const reiniciar = useCallback(() => {
    lecturas.current = []
    setProgreso(0)
    setGuia('sin-cara')
    pausado.current = false
  }, [])

  /** Detiene la lectura sin cerrar la cámara (p. ej. mientras se espera al servidor). */
  const pausar = useCallback(() => { pausado.current = true }, [])

  return { video, estado, guia: pausado.current && progreso >= 1 ? 'listo' : guia, progreso, reiniciar, pausar }
}
