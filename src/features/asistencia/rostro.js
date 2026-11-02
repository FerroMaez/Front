// Reconocimiento facial en el navegador (tablet o celular del jefe).
//
// La cámara NUNCA se envía al servidor: aquí se calcula la "huella facial" (128 números) y
// solo eso viaja. La foto no se guarda en ningún lado.
//
// Modelos (public/models/face-api, ~7 MB, se descargan una vez):
//   · tiny_face_detector  → encuentra la cara en la imagen
//   · face_landmark_68    → 68 puntos de la cara (sirven para detectar el parpadeo)
//   · face_recognition    → la huella de 128 números

const MODELOS = '/models/face-api'
let faceapi = null
let cargando = null

/** Carga la librería y los modelos una sola vez (import dinámico: no pesa en el resto de la app). */
export function cargarModelos() {
  if (!cargando) {
    cargando = (async () => {
      faceapi = await import('@vladmandic/face-api')
      await faceapi.tf.ready()
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODELOS),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODELOS),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODELOS),
      ])
    })().catch((e) => { cargando = null; throw e })
  }
  return cargando
}

/**
 * Detecta UNA cara en el video. Devuelve null si no hay cara clara.
 * @returns {Promise<null | { descriptor: Float32Array, ear: number, tamano: number, score: number }>}
 */
export async function detectar(video) {
  if (!faceapi || !video || video.readyState < 2) return null
  const r = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor()
  if (!r) return null
  const { landmarks, descriptor, detection } = r
  return {
    descriptor,
    ear: (aperturaOjo(landmarks.getLeftEye()) + aperturaOjo(landmarks.getRightEye())) / 2,
    // Qué fracción del ancho del video ocupa la cara (muy lejos = huella poco fiable)
    tamano: detection.box.width / video.videoWidth,
    // Centro de la cara en el cuadro (0..1). x viene sin espejo: la pantalla se ve en espejo.
    centro: {
      x: (detection.box.x + detection.box.width / 2) / video.videoWidth,
      y: (detection.box.y + detection.box.height / 2) / video.videoHeight,
    },
    score: detection.score,
  }
}

/** Distancia máxima del centro de la cara al centro del cuadro para contarla "dentro del círculo". */
export const DESVIO_MAXIMO = 0.16

/**
 * ¿Cómo está la cara respecto al círculo guía?
 * @returns {'sin-cara' | 'lejos' | 'fuera' | 'ok'}
 */
export function posicionEnCirculo(cara) {
  if (!cara) return 'sin-cara'
  if (cara.tamano < TAMANO_MINIMO) return 'lejos'
  const dx = cara.centro.x - 0.5
  const dy = cara.centro.y - 0.5
  return Math.hypot(dx, dy) > DESVIO_MAXIMO ? 'fuera' : 'ok'
}

/**
 * "Eye Aspect Ratio": alto del ojo / ancho del ojo. Abierto ≈ 0.3, cerrado < 0.2.
 * Sirve como prueba de vida: una foto impresa o en un celular no parpadea.
 */
function aperturaOjo(p) {
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
  return (d(p[1], p[5]) + d(p[2], p[4])) / (2 * d(p[0], p[3]))
}

/** Promedia varias huellas de la misma persona: más estable que una sola toma. */
export function promediar(descriptores) {
  const n = descriptores.length
  const out = new Array(128).fill(0)
  for (const d of descriptores) for (let i = 0; i < 128; i++) out[i] += d[i] / n
  return out
}

export const OJO_CERRADO = 0.2
export const OJO_ABIERTO = 0.25
export const TAMANO_MINIMO = 0.18

/** Abre la cámara frontal. */
export async function abrirCamara(video) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  })
  video.srcObject = stream
  await video.play()
  return stream
}

export function cerrarCamara(stream) {
  stream?.getTracks().forEach((t) => t.stop())
}
