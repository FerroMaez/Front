import { Client } from '@stomp/stompjs'

// WebSocket NATIVO (wss). Antes usábamos SockJS, que fallaba cross-origin en el
// navegador (front en el dominio raíz, API en el subdominio api) → se quedaba en
// "Conectando…". El WS nativo conecta limpio; Nginx ya lo proxea con upgrade en /ws.
const WS_URL = ((import.meta.env.VITE_API_URL || 'http://localhost:8080/api')
  .replace(/\/api\/?$/, '') + '/ws')
  .replace(/^http/, 'ws')   // http->ws, https->wss

let stompClient = null
let lastStatus = 'connecting'
const alertaListeners = new Set()
const ordenListeners  = new Set()
const statusListeners = new Set()

function notifyAll(set, data) {
  set.forEach(fn => { try { fn(data) } catch (_) {} })
}

export const websocketService = {
  onAlerta(fn) {
    alertaListeners.add(fn)
    return () => alertaListeners.delete(fn)
  },
  onOrden(fn) {
    ordenListeners.add(fn)
    return () => ordenListeners.delete(fn)
  },
  onStatus(fn) {
    statusListeners.add(fn)
    fn(lastStatus)   // entrega el estado actual de inmediato (aunque ya esté conectado)
    return () => statusListeners.delete(fn)
  },

  connect() {
    if (stompClient?.active) return

    stompClient = new Client({
      brokerURL: WS_URL,
      // El backend exige JWT en el CONNECT (StompAuthChannelInterceptor).
      connectHeaders: { Authorization: `Bearer ${localStorage.getItem('manhid-token') || ''}` },
      reconnectDelay: 5000,
      onConnect: () => {
        lastStatus = 'connected'
        notifyAll(statusListeners, 'connected')
        stompClient.subscribe('/topic/alertas', (msg) => {
          try { notifyAll(alertaListeners, JSON.parse(msg.body)) } catch (_) {}
        })
        stompClient.subscribe('/topic/ordenes', (msg) => {
          try { notifyAll(ordenListeners, JSON.parse(msg.body)) } catch (_) {}
        })
      },
      onDisconnect:     () => { lastStatus = 'disconnected'; notifyAll(statusListeners, 'disconnected') },
      onStompError:     () => { lastStatus = 'disconnected'; notifyAll(statusListeners, 'disconnected') },
      onWebSocketError: () => { lastStatus = 'disconnected'; notifyAll(statusListeners, 'disconnected') },
    })

    stompClient.activate()
  },

  disconnect() {
    stompClient?.deactivate()
    stompClient = null
  },
}
