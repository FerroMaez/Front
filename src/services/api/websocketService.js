import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '') + '/ws'

let stompClient = null

export const websocketService = {
  connect({ onAlerta, onNuevaOrden, onStatusChange }) {
    if (stompClient?.connected) return

    stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        onStatusChange?.('connected')

        stompClient.subscribe('/topic/alertas', (msg) => {
          try {
            const data = JSON.parse(msg.body)
            onAlerta?.(data)
          } catch (_) {}
        })

        stompClient.subscribe('/topic/ordenes', (msg) => {
          try {
            const data = JSON.parse(msg.body)
            onNuevaOrden?.(data)
          } catch (_) {}
        })
      },
      onDisconnect: () => onStatusChange?.('disconnected'),
      onStompError: () => onStatusChange?.('disconnected'),
      onWebSocketError: () => onStatusChange?.('disconnected'),
    })

    stompClient.activate()
  },

  disconnect() {
    stompClient?.deactivate()
    stompClient = null
  },
}
