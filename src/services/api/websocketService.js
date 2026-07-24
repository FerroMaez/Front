import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '') + '/ws'

let stompClient = null
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
    return () => statusListeners.delete(fn)
  },

  connect() {
    if (stompClient?.active) return

    stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        notifyAll(statusListeners, 'connected')
        stompClient.subscribe('/topic/alertas', (msg) => {
          try { notifyAll(alertaListeners, JSON.parse(msg.body)) } catch (_) {}
        })
        stompClient.subscribe('/topic/ordenes', (msg) => {
          try { notifyAll(ordenListeners, JSON.parse(msg.body)) } catch (_) {}
        })
      },
      onDisconnect:     () => notifyAll(statusListeners, 'disconnected'),
      onStompError:     () => notifyAll(statusListeners, 'disconnected'),
      onWebSocketError: () => notifyAll(statusListeners, 'disconnected'),
    })

    stompClient.activate()
  },

  disconnect() {
    stompClient?.deactivate()
    stompClient = null
  },
}
